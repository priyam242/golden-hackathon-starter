"""
Golden Hackathon Starter — Core Configuration
Decoupled, zero-hardcoding environment configuration.
"""

import os
from typing import List

APP_NAME: str = os.getenv("APP_NAME", "GoldenHackathon")
PORT: int = int(os.getenv("PORT", "5000"))
SECRET_KEY: str = os.getenv("JWT_SECRET", "golden-hackathon-super-secret-key-2026")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "golden_starter.db")
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DB_PATH}")

UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "*"
]

# Module Toggles
ENABLE_BILLING_MODULE: bool = os.getenv("ENABLE_BILLING_MODULE", "true").lower() in ("1", "true", "yes")
ENABLE_SPENDX_MODULE: bool = os.getenv("ENABLE_SPENDX_MODULE", "true").lower() in ("1", "true", "yes")
