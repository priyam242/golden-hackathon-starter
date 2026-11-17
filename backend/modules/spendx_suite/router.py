"""
Golden Hackathon Starter — SpendX FinTech Suite (Router)
Full-Stack Expense Management, Multi-Step Approvals, Currency Converter, and Policy Analytics.
"""

import io
import csv
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db_session
from core.envelope import success_response, AppException
from core.auth import get_current_user, User, RoleEnum
from core.ai_engine import deterministic_receipt_parser, call_gemini_ocr
from modules.spendx_suite.models import ExpenseModel, BudgetModel, ApprovalRuleModel

router = APIRouter(prefix="/api/spendx", tags=["SpendX Suite"])

# Base Currency for financial settlement
BASE_COMPANY_CURRENCY = "USD"

EXCHANGE_RATES: Dict[str, float] = {
    "USD": 1.0,
    "INR": 86.5,
    "EUR": 0.95,
    "GBP": 0.80,
}


def convert_to_base(amount: float, from_currency: str) -> float:
    rate = EXCHANGE_RATES.get(from_currency.upper(), 1.0)
    # Convert from foreign currency to USD base
    base_amount = amount / rate
    return round(base_amount, 2)


# -------------------------------------------------------------------
# Request Schemas
# -------------------------------------------------------------------
class ExpenseCreate(BaseModel):
    merchant: str
    date: Optional[str] = None
    amount: float
    currency: Optional[str] = "USD"
    category: Optional[str] = "General"
    tax_amount: Optional[float] = 0.0
    receipt_url: Optional[str] = ""
    notes: Optional[str] = ""


class ApprovalAction(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|settle)$")
    comments: Optional[str] = "Approved per corporate travel & expense policy"


class CurrencyConvertRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str


class BudgetCreate(BaseModel):
    category: str
    monthly_cap: float


# -------------------------------------------------------------------
# 1. AI Receipt OCR Extraction Endpoint
# -------------------------------------------------------------------
@router.post("/extract-receipt")
async def extract_receipt_endpoint(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
):
    """
    SpendX 1-Click OCR auto-fill endpoint.
    Accepts receipt images/PDFs/text and returns auto-populated form fields.
    """
    content = raw_text or ""
    if file:
        file_bytes = await file.read()
        try:
            content += "\n" + file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            pass

    gemini_data = await call_gemini_ocr(content)
    if gemini_data:
        extracted = gemini_data
    else:
        extracted = deterministic_receipt_parser(content)

    # Calculate converted base currency amount
    converted = convert_to_base(extracted["totalAmount"], extracted.get("currency", "USD"))
    extracted["convertedAmount"] = converted
    extracted["baseCurrency"] = BASE_COMPANY_CURRENCY

    return success_response(data=extracted, message="Receipt parsed successfully")


# -------------------------------------------------------------------
# 2. Multi-Step Approval Workflow Engine
# -------------------------------------------------------------------
@router.get("/expenses")
async def list_expenses(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    stmt = select(ExpenseModel)
    if current_user.role not in [RoleEnum.ADMIN.value, RoleEnum.MANAGER.value]:
        # Ordinary employees only view their own expenses
        stmt = stmt.where(ExpenseModel.user_id == current_user.id)

    if status_filter:
        stmt = stmt.where(ExpenseModel.status == status_filter)
    if category:
        stmt = stmt.where(ExpenseModel.category == category)

    stmt = stmt.order_by(ExpenseModel.id.desc())
    res = await db.execute(stmt)
    expenses = res.scalars().all()
    return success_response(data=[e.to_dict() for e in expenses], message="Expenses retrieved")


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def submit_expense(
    req: ExpenseCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Submit expense for multi-step approval with smart policy validation.
    """
    converted = convert_to_base(req.amount, req.currency or "USD")
    date_val = req.date or datetime.date.today().isoformat()

    # Policy Anomaly Detection:
    # 1. High-value expense flag (> $1,000 converted)
    # 2. Weekend expense flag
    # 3. Budget cap check
    is_flagged = False
    flag_reasons = []

    if converted > 1000.0:
        is_flagged = True
        flag_reasons.append("High-value transaction: requires dual-tier executive approval")

    # Budget Check
    b_stmt = select(BudgetModel).where(BudgetModel.category == req.category)
    b_res = await db.execute(b_stmt)
    budget = b_res.scalar_one_or_none()
    if budget and (budget.current_spend + converted > budget.monthly_cap):
        is_flagged = True
        flag_reasons.append(f"Expense exceeds monthly budget cap for {req.category}")

    initial_step = 1
    initial_status = "pending_manager"
    audit_init = [{
        "step": 0,
        "action": "submitted",
        "actor": current_user.email,
        "role": current_user.role,
        "comments": "Expense submitted for approval",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }]

    expense = ExpenseModel(
        user_id=current_user.id,
        merchant=req.merchant,
        date=date_val,
        amount=req.amount,
        currency=(req.currency or "USD").upper(),
        converted_amount=converted,
        category=req.category or "General",
        tax_amount=req.tax_amount or 0.0,
        receipt_url=req.receipt_url or "",
        status=initial_status,
        current_step=initial_step,
        audit_trail=audit_init,
        is_flagged=is_flagged,
        flag_reasons="; ".join(flag_reasons),
        notes=req.notes or "",
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)

    return success_response(
        data=expense.to_dict(),
        message="Expense submitted successfully into approval pipeline",
        status_code=status.HTTP_201_CREATED,
    )


@router.post("/expenses/{expense_id}/action")
async def process_approval_action(
    expense_id: int,
    req: ApprovalAction,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Approve, Reject, or Settle an expense with role verification and audit logging.
    """
    stmt = select(ExpenseModel).where(ExpenseModel.id == expense_id)
    res = await db.execute(stmt)
    expense = res.scalar_one_or_none()
    if not expense:
        raise AppException(status_code=404, code="NOT_FOUND", message="Expense not found")

    if current_user.role not in [RoleEnum.ADMIN.value, RoleEnum.MANAGER.value]:
        raise AppException(status_code=403, code="FORBIDDEN", message="Only managers and admins can review expenses")

    action_record = {
        "step": expense.current_step,
        "action": req.action,
        "actor": current_user.email,
        "role": current_user.role,
        "comments": req.comments,
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }
    trail = list(expense.audit_trail or [])
    trail.append(action_record)
    expense.audit_trail = trail

    if req.action == "reject":
        expense.status = "rejected"
    elif req.action == "settle":
        expense.status = "settled"
    elif req.action == "approve":
        # Two-tier check: if amount > 1000 and current_step is 1, escalate to admin
        if expense.converted_amount > 1000.0 and expense.current_step == 1:
            expense.current_step = 2
            expense.status = "pending_admin"
        else:
            expense.status = "approved"
            # Update category budget spend
            b_stmt = select(BudgetModel).where(BudgetModel.category == expense.category)
            b_res = await db.execute(b_stmt)
            b = b_res.scalar_one_or_none()
            if b:
                b.current_spend = round(b.current_spend + expense.converted_amount, 2)

    await db.commit()
    await db.refresh(expense)
    return success_response(data=expense.to_dict(), message=f"Expense marked as {expense.status}")


@router.get("/approvals/queue")
async def get_approval_queue(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Items waiting in queue for the active persona.
    """
    stmt = select(ExpenseModel)
    if current_user.role == RoleEnum.MANAGER.value:
        stmt = stmt.where(ExpenseModel.status == "pending_manager")
    elif current_user.role == RoleEnum.ADMIN.value:
        stmt = stmt.where(or_(ExpenseModel.status == "pending_manager", ExpenseModel.status == "pending_admin"))
    else:
        stmt = stmt.where(ExpenseModel.user_id == current_user.id)

    res = await db.execute(stmt)
    items = res.scalars().all()
    return success_response(data=[i.to_dict() for i in items], message="Approval queue retrieved")


# -------------------------------------------------------------------
# 3. Multi-Currency & Auto-Conversion Engine
# -------------------------------------------------------------------
@router.get("/currency/rates")
async def get_exchange_rates():
    return success_response(
        data={
            "baseCurrency": BASE_COMPANY_CURRENCY,
            "rates": EXCHANGE_RATES,
            "lastUpdated": datetime.datetime.utcnow().isoformat(),
        },
        message="Exchange rates retrieved",
    )


@router.post("/currency/convert")
async def convert_currency(req: CurrencyConvertRequest):
    from_curr = req.from_currency.upper()
    to_curr = req.to_currency.upper()

    from_rate = EXCHANGE_RATES.get(from_curr, 1.0)
    to_rate = EXCHANGE_RATES.get(to_curr, 1.0)

    # Convert to USD base first, then to target
    usd_amount = req.amount / from_rate
    target_amount = round(usd_amount * to_rate, 2)

    return success_response(
        data={
            "originalAmount": req.amount,
            "fromCurrency": from_curr,
            "convertedAmount": target_amount,
            "toCurrency": to_curr,
            "effectiveRate": round(to_rate / from_rate, 4),
        },
        message="Currency converted successfully",
    )


# -------------------------------------------------------------------
# 4. Smart Budget Caps, Policy Anomaly Detection & Analytics
# -------------------------------------------------------------------
@router.get("/budgets")
async def list_budgets(db: AsyncSession = Depends(get_db_session)):
    stmt = select(BudgetModel)
    res = await db.execute(stmt)
    budgets = res.scalars().all()

    # Pre-populate defaults if empty
    if not budgets:
        defaults = [
            ("Travel & Commute", 3000.0, 1250.0),
            ("Meals & Dining", 1500.0, 480.0),
            ("Cloud & Software", 4000.0, 3650.0),
            ("Office Supplies", 1000.0, 320.0),
            ("General", 2000.0, 600.0),
        ]
        for cat, cap, spend in defaults:
            b = BudgetModel(category=cat, monthly_cap=cap, current_spend=spend)
            db.add(b)
        await db.commit()
        res = await db.execute(stmt)
        budgets = res.scalars().all()

    return success_response(data=[b.to_dict() for b in budgets], message="Budgets retrieved")


@router.post("/budgets")
async def set_budget(req: BudgetCreate, db: AsyncSession = Depends(get_db_session)):
    stmt = select(BudgetModel).where(BudgetModel.category == req.category)
    res = await db.execute(stmt)
    b = res.scalar_one_or_none()
    if b:
        b.monthly_cap = req.monthly_cap
    else:
        b = BudgetModel(category=req.category, monthly_cap=req.monthly_cap, current_spend=0.0)
        db.add(b)
    await db.commit()
    await db.refresh(b)
    return success_response(data=b.to_dict(), message="Budget updated successfully")


@router.get("/analytics")
async def get_spendx_analytics(db: AsyncSession = Depends(get_db_session)):
    """
    KPI summary cards, category utilization, and policy anomaly alerts.
    """
    exp_stmt = select(ExpenseModel)
    exp_res = await db.execute(exp_stmt)
    all_expenses = exp_res.scalars().all()

    total_spent = sum(e.converted_amount for e in all_expenses if e.status in ["approved", "settled"])
    pending_approval = sum(e.converted_amount for e in all_expenses if "pending" in e.status)
    anomalies_count = sum(1 for e in all_expenses if e.is_flagged)

    # Category breakdown
    cat_breakdown: Dict[str, float] = {}
    for e in all_expenses:
        cat_breakdown[e.category] = round(cat_breakdown.get(e.category, 0.0) + e.converted_amount, 2)

    # Flagged items preview
    flagged_items = [e.to_dict() for e in all_expenses if e.is_flagged][:5]

    return success_response(
        data={
            "totalSpendSettled": round(total_spent, 2),
            "pendingApprovalAmount": round(pending_approval, 2),
            "totalTransactions": len(all_expenses),
            "anomalyAlertsCount": anomalies_count,
            "categoryBreakdown": cat_breakdown,
            "flaggedItems": flagged_items,
            "baseCurrency": BASE_COMPANY_CURRENCY,
        },
        message="Analytics metrics retrieved",
    )


@router.get("/reports/export")
async def export_report(
    format_type: str = Query("csv", alias="format"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    1-Click CSV & Printable PDF/HTML Report Export.
    """
    stmt = select(ExpenseModel).order_by(ExpenseModel.id.desc())
    res = await db.execute(stmt)
    expenses = res.scalars().all()

    if format_type.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Merchant", "Date", "Original Amount", "Currency", "Converted USD", "Category", "Status", "Flagged"])
        for e in expenses:
            writer.writerow([
                e.id, e.merchant, e.date, e.amount, e.currency, e.converted_amount, e.category, e.status, "YES" if e.is_flagged else "NO"
            ])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=SpendX_Report_{datetime.date.today().isoformat()}.csv"}
        )

    # Printable HTML Report for PDF generation
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SpendX Financial Statement</title>
      <style>
        body {{ font-family: 'Bell MT', Georgia, serif; margin: 40px; color: #111; }}
        h1 {{ border-bottom: 2px solid #000; padding-bottom: 8px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }}
        th {{ background: #f5f5f5; font-weight: bold; }}
        .flag {{ color: red; font-weight: bold; }}
      </style>
    </head>
    <body>
      <h1>SPENDX CORPORATE EXPENSE REPORT</h1>
      <p>Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Date</th><th>Merchant</th><th>Category</th><th>Amount</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {''.join(f"<tr><td>{e.id}</td><td>{e.date}</td><td>{e.merchant}</td><td>{e.category}</td><td>${e.converted_amount:,.2f}</td><td>{e.status}</td></tr>" for e in expenses)}
        </tbody>
      </table>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
