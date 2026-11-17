"""
Golden Hackathon Starter — SpendX FinTech Suite (Models)
Data layer for Expenses, Receipts, Multi-Step Approvals, Budgets, and Policy Rules.
"""

import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class ExpenseModel(Base):
    __tablename__ = "spendx_expenses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    merchant: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    converted_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="General", nullable=False)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    receipt_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(50), default="pending_manager")  # pending_manager, pending_admin, approved, rejected, settled
    current_step: Mapped[int] = mapped_column(Integer, default=1)
    audit_trail: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    flag_reasons: Mapped[str] = mapped_column(String(500), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "userId": self.user_id,
            "merchant": self.merchant,
            "date": self.date,
            "amount": self.amount,
            "currency": self.currency,
            "convertedAmount": self.converted_amount,
            "category": self.category,
            "taxAmount": self.tax_amount,
            "receiptUrl": self.receipt_url,
            "status": self.status,
            "currentStep": self.current_step,
            "auditTrail": self.audit_trail or [],
            "isFlagged": self.is_flagged,
            "flagReasons": self.flag_reasons,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class BudgetModel(Base):
    __tablename__ = "spendx_budgets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    monthly_cap: Mapped[float] = mapped_column(Float, nullable=False)
    current_spend: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    period: Mapped[str] = mapped_column(String(20), default=datetime.date.today().strftime("%Y-%m"))

    def to_dict(self) -> Dict[str, Any]:
        utilization = round((self.current_spend / self.monthly_cap * 100), 1) if self.monthly_cap > 0 else 0
        return {
            "id": self.id,
            "category": self.category,
            "monthlyCap": self.monthly_cap,
            "currentSpend": self.current_spend,
            "utilization": utilization,
            "isOverBudget": self.current_spend > self.monthly_cap,
            "period": self.period,
        }


class ApprovalRuleModel(Base):
    __tablename__ = "spendx_approval_rules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    min_amount: Mapped[float] = mapped_column(Float, default=0.0)
    max_amount: Mapped[float] = mapped_column(Float, default=999999.0)
    required_role: Mapped[str] = mapped_column(String(50), default="manager")
    auto_flag_threshold: Mapped[float] = mapped_column(Float, default=5000.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "minAmount": self.min_amount,
            "maxAmount": self.max_amount,
            "requiredRole": self.required_role,
            "autoFlagThreshold": self.auto_flag_threshold,
        }
