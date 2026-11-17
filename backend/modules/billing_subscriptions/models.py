"""
Golden Hackathon Starter — Billing & Subscriptions Module (Models)
Universal SaaS / Recurring Revenue Data Layer.
"""

import datetime
from typing import Dict, Any, Optional
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class ProductModel(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sku: Mapped[str] = mapped_column(String(50), default="SKU-GEN", nullable=False)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "unitPrice": self.unit_price,
            "sku": self.sku,
            "isRecurring": self.is_recurring,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class PlanModel(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    billing_interval: Mapped[str] = mapped_column(String(50), default="monthly", nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    trial_days: Mapped[int] = mapped_column(Integer, default=14, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "productId": self.product_id,
            "name": self.name,
            "billingInterval": self.billing_interval,
            "price": self.price,
            "trialDays": self.trial_days,
        }


class QuotationModel(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    quote_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, sent, approved, converted
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    valid_until: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "quoteNumber": self.quote_number,
            "customerId": self.customer_id,
            "planId": self.plan_id,
            "status": self.status,
            "subtotal": self.subtotal,
            "taxAmount": self.tax_amount,
            "totalAmount": self.total_amount,
            "validUntil": self.valid_until,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class SubscriptionModel(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sub_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, paused, closed
    start_date: Mapped[str] = mapped_column(String(50), default="")
    next_billing_date: Mapped[str] = mapped_column(String(50), default="")
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True)
    recurring_amount: Mapped[float] = mapped_column(Float, default=0.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "subNumber": self.sub_number,
            "customerId": self.customer_id,
            "planId": self.plan_id,
            "status": self.status,
            "startDate": self.start_date,
            "nextBillingDate": self.next_billing_date,
            "autoRenew": self.auto_renew,
            "recurringAmount": self.recurring_amount,
        }


class InvoiceModel(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    subscription_id: Mapped[int] = mapped_column(Integer, default=0)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, confirmed, paid, cancelled
    due_date: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "invoiceNumber": self.invoice_number,
            "subscriptionId": self.subscription_id,
            "customerId": self.customer_id,
            "amount": self.amount,
            "status": self.status,
            "dueDate": self.due_date,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
