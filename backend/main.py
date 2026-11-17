"""
Golden Hackathon Starter — Master Backend Application
Modular 2-layer FastAPI engine: Core Spine (Immutable) + Domain Modules (Plug-and-Play).
"""

import os
import contextlib
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import (
    APP_NAME, PORT, CORS_ORIGINS,
    ENABLE_BILLING_MODULE, ENABLE_SPENDX_MODULE
)
from core.database import init_db, AsyncSessionLocal, get_db_session
from core.envelope import success_response, register_exception_handlers
from core.auth import User, RoleEnum, hash_password, router as auth_router
from core.ai_engine import router as ai_router
from core.files import router as files_router
from core.realtime import router as realtime_router


# Lifespan Context for Database Initialization & Demo Persona Seeding
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    # Seed default personas for 1-click switcher
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).limit(1))
        if not res.scalar_one_or_none():
            seed_users = [
                User(
                    email="admin@hackathon.internal",
                    password_hash=hash_password("Admin@2026"),
                    full_name="Lead Architect (Admin)",
                    role=RoleEnum.ADMIN.value,
                    company=f"{APP_NAME} HQ",
                    is_active=True,
                ),
                User(
                    email="manager@hackathon.internal",
                    password_hash=hash_password("Manager@2026"),
                    full_name="Finance Approver (Manager)",
                    role=RoleEnum.MANAGER.value,
                    company=f"{APP_NAME} Ops",
                    is_active=True,
                ),
                User(
                    email="employee@hackathon.internal",
                    password_hash=hash_password("Employee@2026"),
                    full_name="Alex Rivera (Employee)",
                    role=RoleEnum.USER.value,
                    company="Engineering Department",
                    is_active=True,
                ),
                User(
                    email="customer@acme.com",
                    password_hash=hash_password("Acme@2026"),
                    full_name="Sarah Connor (Client)",
                    role=RoleEnum.CUSTOMER.value,
                    company="Acme Corporation",
                    is_active=True,
                ),
            ]
            session.add_all(seed_users)
            await session.commit()
    yield


app = FastAPI(
    title=f"{APP_NAME} API Engine",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Register Exception Handlers & CORS
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# 1. Mount Core Spine (Immutable)
# -------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(files_router)
app.include_router(realtime_router)


# -------------------------------------------------------------------
# 2. Mount Domain Modules (Toggleable)
# -------------------------------------------------------------------
if ENABLE_BILLING_MODULE:
    from modules.billing_subscriptions.router import router as billing_router
    app.include_router(billing_router)

if ENABLE_SPENDX_MODULE:
    from modules.spendx_suite.router import router as spendx_router
    app.include_router(spendx_router)

# Mount S01 Sprint Module
from modules.s01_core.router import router as s01_router
app.include_router(s01_router)


# -------------------------------------------------------------------
# 3. System & Health Probes
# -------------------------------------------------------------------
@app.get("/api/health")
@app.get("/health")
async def health_check():
    return success_response(
        data={
            "status": "healthy",
            "app": APP_NAME,
            "version": "2.0.0",
            "modules": {
                "billing": ENABLE_BILLING_MODULE,
                "spendx": ENABLE_SPENDX_MODULE,
                "s01": True,
            },
        },
        message=f"{APP_NAME} API is operational",
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
