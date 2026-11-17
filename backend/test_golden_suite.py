"""
Golden Hackathon Starter — Automated Master Test Suite
Verifies Core Spine, Persona Switcher, AI Engine, SpendX Suite, and Billing Modules.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app, init_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    import asyncio
    asyncio.run(init_db())


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_01_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert data["data"]["modules"]["spendx"] is True


def test_02_auth_register_and_login(client):
    # Register
    reg_res = client.post("/api/auth/register", json={
        "email": "testagent@hackathon.com",
        "password": "Password@2026",
        "full_name": "Test Agent",
        "role": "admin"
    })
    assert reg_res.status_code in (201, 409)

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "testagent@hackathon.com",
        "password": "Password@2026"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["success"] is True
    assert "accessToken" in data["data"]


def test_03_persona_switcher(client):
    res = client.get("/api/auth/personas")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "personas" in data["data"]

    # Switch persona
    switch_res = client.post("/api/auth/switch-persona", json={"role": "admin"})
    assert switch_res.status_code == 200
    switch_data = switch_res.json()
    assert switch_data["data"]["user"]["role"] == "admin"


def test_04_ai_receipt_ocr_extract(client):
    receipt_sample = (
        "STARBUCKS STORE #9901\n"
        "Date: 2026-11-17\n"
        "Espresso Roast   1   $4.50\n"
        "Croissant        2   $6.00\n"
        "Sales Tax: $0.87\n"
        "Total Amount: $11.37\n"
        "Thank you!"
    )
    res = client.post("/api/ai/extract", data={"raw_text": receipt_sample})
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["merchant"] == "Starbucks"
    assert data["totalAmount"] == 11.37
    assert data["category"] == "Meals & Dining"


def test_05_file_upload_and_view(client):
    file_content = b"header1,header2\nval1,val2"
    files = {"file": ("test_report.csv", file_content, "text/csv")}
    res = client.post("/api/files/upload", files=files)
    assert res.status_code == 201
    meta = res.json()["data"]
    assert meta["originalName"] == "test_report.csv"

    # View file
    view_res = client.get(meta["url"])
    assert view_res.status_code == 200
    assert b"val1,val2" in view_res.content


def test_06_spendx_currency_convert(client):
    res = client.post("/api/spendx/currency/convert", json={
        "amount": 100.0,
        "from_currency": "USD",
        "to_currency": "INR"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["convertedAmount"] == 8650.0
    assert data["toCurrency"] == "INR"


def test_07_spendx_expense_submission_and_approvals(client):
    # Get Admin token
    login_res = client.post("/api/auth/switch-persona", json={"role": "admin"})
    token = login_res.json()["data"]["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit expense
    exp_res = client.post("/api/spendx/expenses", json={
        "merchant": "Delta Airlines",
        "date": "2026-11-17",
        "amount": 1250.0,
        "currency": "USD",
        "category": "Travel & Commute",
        "notes": "Flight to Hackathon Finals"
    }, headers=headers)
    assert exp_res.status_code == 201
    expense = exp_res.json()["data"]
    assert expense["merchant"] == "Delta Airlines"
    assert expense["isFlagged"] is True  # > 1000 threshold flag
    exp_id = expense["id"]

    # Manager / Admin Action: Step 1 Approval
    action_res = client.post(f"/api/spendx/expenses/{exp_id}/action", json={
        "action": "approve",
        "comments": "Executive travel pre-approved"
    }, headers=headers)
    assert action_res.status_code == 200
    updated_exp = action_res.json()["data"]
    # Escalated to pending_admin because converted amount > 1000
    assert updated_exp["status"] in ("pending_admin", "approved")


def test_08_spendx_analytics_and_export(client):
    res = client.get("/api/spendx/analytics")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "totalTransactions" in data
    assert "categoryBreakdown" in data

    # CSV Export
    csv_res = client.get("/api/spendx/reports/export?format=csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")


def test_09_billing_subscription_pipeline(client):
    # Create product
    prod_res = client.post("/api/products", json={
        "name": "Cloud Pro Plan",
        "unit_price": 99.0,
        "is_recurring": True
    })
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["data"]["id"]

    # Create plan
    plan_res = client.post("/api/plans", json={
        "product_id": prod_id,
        "name": "Monthly Pro",
        "price": 99.0
    })
    assert plan_res.status_code == 201
    plan_id = plan_res.json()["data"]["id"]

    # Create quote
    quote_res = client.post("/api/quotations", json={
        "customer_id": 1,
        "plan_id": plan_id
    })
    assert quote_res.status_code == 201
    quote_id = quote_res.json()["data"]["id"]

    # Convert quote to subscription
    convert_res = client.post(f"/api/quotations/{quote_id}/convert")
    assert convert_res.status_code == 200
    assert convert_res.json()["data"]["subscription"]["status"] == "active"

    # Automated billing run
    bill_res = client.post("/api/billing/run")
    assert bill_res.status_code == 200
    assert bill_res.json()["data"]["invoicesGenerated"] >= 1


def test_10_s01_sprint_crud(client):
    res = client.post("/api/items", json={
        "title": "Build Demo Deck",
        "description": "Prepare 3-minute pitch for hackathon judges"
    })
    assert res.status_code == 201
    item = res.json()["data"]
    assert item["title"] == "Build Demo Deck"

    list_res = client.get("/api/items")
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1
