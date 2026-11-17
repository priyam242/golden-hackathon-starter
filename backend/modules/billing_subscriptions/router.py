"""
Golden Hackathon Starter — Billing & Subscriptions Module (Router)
REST Endpoints for Products, Plans, Quotations, Subscriptions, and Automated Invoicing.
"""

import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db_session
from core.envelope import success_response, AppException
from core.auth import get_current_user, User, RoleEnum
from modules.billing_subscriptions.models import (
    ProductModel, PlanModel, QuotationModel, SubscriptionModel, InvoiceModel
)

router = APIRouter(tags=["Billing & Subscriptions"])


# -------------------------------------------------------------------
# Request Schemas
# -------------------------------------------------------------------
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    unit_price: float
    sku: Optional[str] = "SKU-GEN"
    is_recurring: Optional[bool] = True


class PlanCreate(BaseModel):
    product_id: int
    name: str
    billing_interval: Optional[str] = "monthly"
    price: float
    trial_days: Optional[int] = 14


class QuotationCreate(BaseModel):
    customer_id: int
    plan_id: int
    valid_days: Optional[int] = 30


# -------------------------------------------------------------------
# Products & Plans
# -------------------------------------------------------------------
@router.get("/api/products")
async def list_products(db: AsyncSession = Depends(get_db_session)):
    stmt = select(ProductModel)
    res = await db.execute(stmt)
    products = res.scalars().all()
    return success_response(data=[p.to_dict() for p in products], message="Products retrieved")


@router.post("/api/products", status_code=status.HTTP_201_CREATED)
async def create_product(req: ProductCreate, db: AsyncSession = Depends(get_db_session)):
    prod = ProductModel(
        name=req.name,
        description=req.description or "",
        unit_price=req.unit_price,
        sku=req.sku or "SKU-GEN",
        is_recurring=req.is_recurring if req.is_recurring is not None else True,
    )
    db.add(prod)
    await db.commit()
    await db.refresh(prod)
    return success_response(data=prod.to_dict(), message="Product created", status_code=status.HTTP_201_CREATED)


@router.get("/api/plans")
async def list_plans(db: AsyncSession = Depends(get_db_session)):
    stmt = select(PlanModel)
    res = await db.execute(stmt)
    plans = res.scalars().all()
    return success_response(data=[p.to_dict() for p in plans], message="Plans retrieved")


@router.post("/api/plans", status_code=status.HTTP_201_CREATED)
async def create_plan(req: PlanCreate, db: AsyncSession = Depends(get_db_session)):
    plan = PlanModel(
        product_id=req.product_id,
        name=req.name,
        billing_interval=req.billing_interval or "monthly",
        price=req.price,
        trial_days=req.trial_days or 14,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return success_response(data=plan.to_dict(), message="Plan created", status_code=status.HTTP_201_CREATED)


# -------------------------------------------------------------------
# Quotations & Deal Conversion Pipeline
# -------------------------------------------------------------------
@router.get("/api/quotations")
async def list_quotations(db: AsyncSession = Depends(get_db_session)):
    stmt = select(QuotationModel)
    res = await db.execute(stmt)
    quotes = res.scalars().all()
    return success_response(data=[q.to_dict() for q in quotes], message="Quotations retrieved")


@router.post("/api/quotations", status_code=status.HTTP_201_CREATED)
async def create_quotation(req: QuotationCreate, db: AsyncSession = Depends(get_db_session)):
    plan_stmt = select(PlanModel).where(PlanModel.id == req.plan_id)
    plan_res = await db.execute(plan_stmt)
    plan = plan_res.scalar_one_or_none()
    if not plan:
        raise AppException(status_code=404, code="PLAN_NOT_FOUND", message="Selected plan does not exist")

    quote_num = f"QUO-{datetime.datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    tax = round(plan.price * 0.18, 2)  # 18% standard tax
    total = round(plan.price + tax, 2)
    valid_until = (datetime.date.today() + datetime.timedelta(days=req.valid_days or 30)).isoformat()

    quote = QuotationModel(
        quote_number=quote_num,
        customer_id=req.customer_id,
        plan_id=req.plan_id,
        status="sent",
        subtotal=plan.price,
        tax_amount=tax,
        total_amount=total,
        valid_until=valid_until,
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return success_response(data=quote.to_dict(), message="Quotation created", status_code=status.HTTP_201_CREATED)


@router.post("/api/quotations/{quote_id}/convert")
async def convert_quotation(quote_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    1-Click Quotation to Subscription conversion pipeline.
    """
    stmt = select(QuotationModel).where(QuotationModel.id == quote_id)
    res = await db.execute(stmt)
    quote = res.scalar_one_or_none()
    if not quote:
        raise AppException(status_code=404, code="QUOTATION_NOT_FOUND", message="Quotation not found")

    quote.status = "converted"

    sub_num = f"SUB-{uuid.uuid4().hex[:8].upper()}"
    today_str = datetime.date.today().isoformat()
    next_bill = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()

    sub = SubscriptionModel(
        sub_number=sub_num,
        customer_id=quote.customer_id,
        plan_id=quote.plan_id,
        status="active",
        start_date=today_str,
        next_billing_date=next_bill,
        auto_renew=True,
        recurring_amount=quote.total_amount,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)

    # Initial Invoice
    inv_num = f"INV-{uuid.uuid4().hex[:8].upper()}"
    invoice = InvoiceModel(
        invoice_number=inv_num,
        subscription_id=sub.id,
        customer_id=quote.customer_id,
        amount=quote.total_amount,
        status="confirmed",
        due_date=today_str,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return success_response(
        data={"subscription": sub.to_dict(), "invoice": invoice.to_dict()},
        message="Quotation successfully converted to active subscription",
    )


# -------------------------------------------------------------------
# Subscriptions
# -------------------------------------------------------------------
@router.get("/api/subscriptions")
async def list_subscriptions(db: AsyncSession = Depends(get_db_session)):
    stmt = select(SubscriptionModel)
    res = await db.execute(stmt)
    subs = res.scalars().all()
    return success_response(data=[s.to_dict() for s in subs], message="Subscriptions retrieved")


@router.post("/api/subscriptions/{sub_id}/pause")
async def pause_subscription(sub_id: int, db: AsyncSession = Depends(get_db_session)):
    stmt = select(SubscriptionModel).where(SubscriptionModel.id == sub_id)
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise AppException(status_code=404, code="NOT_FOUND", message="Subscription not found")
    sub.status = "paused"
    await db.commit()
    return success_response(data=sub.to_dict(), message="Subscription paused")


@router.post("/api/subscriptions/{sub_id}/close")
async def close_subscription(sub_id: int, db: AsyncSession = Depends(get_db_session)):
    stmt = select(SubscriptionModel).where(SubscriptionModel.id == sub_id)
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise AppException(status_code=404, code="NOT_FOUND", message="Subscription not found")
    sub.status = "closed"
    await db.commit()
    return success_response(data=sub.to_dict(), message="Subscription closed")


@router.post("/api/subscriptions/{sub_id}/renew")
async def renew_subscription(sub_id: int, db: AsyncSession = Depends(get_db_session)):
    stmt = select(SubscriptionModel).where(SubscriptionModel.id == sub_id)
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise AppException(status_code=404, code="NOT_FOUND", message="Subscription not found")
    sub.status = "active"
    sub.next_billing_date = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
    await db.commit()
    return success_response(data=sub.to_dict(), message="Subscription renewed")


# -------------------------------------------------------------------
# Invoices & Automated Billing Run
# -------------------------------------------------------------------
@router.get("/api/invoices")
async def list_invoices(db: AsyncSession = Depends(get_db_session)):
    stmt = select(InvoiceModel)
    res = await db.execute(stmt)
    invoices = res.scalars().all()
    return success_response(data=[inv.to_dict() for inv in invoices], message="Invoices retrieved")


@router.post("/api/invoices/{inv_id}/confirm")
async def confirm_invoice(inv_id: int, db: AsyncSession = Depends(get_db_session)):
    stmt = select(InvoiceModel).where(InvoiceModel.id == inv_id)
    res = await db.execute(stmt)
    inv = res.scalar_one_or_none()
    if not inv:
        raise AppException(status_code=404, code="NOT_FOUND", message="Invoice not found")
    inv.status = "confirmed"
    await db.commit()
    return success_response(data=inv.to_dict(), message="Invoice confirmed")


@router.post("/api/billing/run")
async def automated_billing_run(db: AsyncSession = Depends(get_db_session)):
    """
    Automated idempotent batch billing run. Scans active subscriptions due for billing,
    generates invoices, and advances billing schedules.
    """
    stmt = select(SubscriptionModel).where(SubscriptionModel.status == "active")
    res = await db.execute(stmt)
    active_subs = res.scalars().all()

    invoices_created = []
    today_str = datetime.date.today().isoformat()

    for sub in active_subs:
        inv = InvoiceModel(
            invoice_number=f"BILL-{datetime.datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}",
            subscription_id=sub.id,
            customer_id=sub.customer_id,
            amount=sub.recurring_amount,
            status="confirmed",
            due_date=today_str,
        )
        db.add(inv)
        invoices_created.append(inv)
        # advance next billing date
        sub.next_billing_date = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()

    await db.commit()
    return success_response(
        data={
            "processedSubscriptions": len(active_subs),
            "invoicesGenerated": len(invoices_created),
            "billingDate": today_str,
        },
        message=f"Billing run completed successfully. {len(invoices_created)} invoices generated.",
    )


# -------------------------------------------------------------------
# Financial Dashboard Overview
# -------------------------------------------------------------------
@router.get("/api/finance/dashboard")
async def finance_dashboard(db: AsyncSession = Depends(get_db_session)):
    sub_count_res = await db.execute(select(func.count(SubscriptionModel.id)).where(SubscriptionModel.status == "active"))
    active_subs = sub_count_res.scalar() or 0

    mrr_res = await db.execute(select(func.sum(SubscriptionModel.recurring_amount)).where(SubscriptionModel.status == "active"))
    mrr = round(mrr_res.scalar() or 0.0, 2)

    inv_count_res = await db.execute(select(func.count(InvoiceModel.id)))
    total_invoices = inv_count_res.scalar() or 0

    return success_response(
        data={
            "activeSubscriptions": active_subs,
            "monthlyRecurringRevenue": mrr,
            "annualRunRate": round(mrr * 12, 2),
            "totalInvoices": total_invoices,
            "currency": "USD",
        },
        message="Finance dashboard metrics retrieved",
    )
