"""
Golden Hackathon Starter — Core Auth & Identity Management
Decoupled JWT Auth with 1-Click Persona Switcher Support & Flexible RBAC.
"""

import datetime
import uuid
from typing import Optional, List, Dict, Any
from enum import Enum

import jwt
import bcrypt
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import String, Boolean, DateTime, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from core.database import Base, get_db_session
from core.envelope import success_response, AppException


class RoleEnum(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=RoleEnum.USER.value, nullable=False)
    company: Mapped[str] = mapped_column(String(255), default="Demo Corp", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
            "company": self.company,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# -------------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    role: Optional[str] = RoleEnum.USER.value
    company: Optional[str] = "Demo Corp"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refreshToken: str


class SwitchPersonaRequest(BaseModel):
    role: Optional[str] = None
    email: Optional[EmailStr] = None


# -------------------------------------------------------------------
# Token Helpers
# -------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_token_pair(user: User) -> Dict[str, Any]:
    now = datetime.datetime.utcnow()
    access_exp = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_exp = now + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "type": "access",
        "exp": access_exp,
        "iat": now,
    }
    refresh_payload = {
        "sub": str(user.id),
        "email": user.email,
        "type": "refresh",
        "exp": refresh_exp,
        "iat": now,
    }

    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm=ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "tokenType": "Bearer",
        "expiresIn": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user.to_dict(),
    }


# -------------------------------------------------------------------
# Auth Dependencies
# -------------------------------------------------------------------
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHENTICATED",
            message="Missing or invalid Bearer authorization header",
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="INVALID_TOKEN",
                message="Expected access token",
            )
        user_id = int(payload.get("sub"))
    except jwt.ExpiredSignatureError:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_EXPIRED",
            message="Access token has expired",
        )
    except Exception:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_TOKEN",
            message="Could not validate credentials",
        )

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="USER_NOT_FOUND",
            message="User account is inactive or not found",
        )
    return user


def require_roles(*allowed_roles: str):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                code="FORBIDDEN",
                message=f"Access denied. Requires one of roles: {list(allowed_roles)}",
            )
        return current_user
    return role_checker


# -------------------------------------------------------------------
# Router Endpoints
# -------------------------------------------------------------------
router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db_session)):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise AppException(
            status_code=status.HTTP_409_CONFLICT,
            code="EMAIL_EXISTS",
            message="An account with this email address already exists",
        )

    new_user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role=req.role or RoleEnum.USER.value,
        company=req.company or "Demo Corp",
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    tokens = create_token_pair(new_user)
    return success_response(data=tokens, message="User registered successfully", status_code=status.HTTP_201_CREATED)


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db_session)):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
            message="Invalid email or password",
        )

    tokens = create_token_pair(user)
    return success_response(data=tokens, message="Login successful")


@router.post("/refresh")
async def refresh_tokens(req: RefreshRequest, db: AsyncSession = Depends(get_db_session)):
    try:
        payload = jwt.decode(req.refreshToken, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise AppException(status_code=401, code="INVALID_TOKEN", message="Expected refresh token")
        user_id = int(payload.get("sub"))
    except Exception:
        raise AppException(status_code=401, code="INVALID_REFRESH_TOKEN", message="Invalid or expired refresh token")

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise AppException(status_code=401, code="USER_NOT_FOUND", message="User not found")

    tokens = create_token_pair(user)
    return success_response(data=tokens, message="Token refreshed successfully")


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return success_response(data=current_user.to_dict(), message="User profile retrieved")


@router.get("/personas")
async def list_personas(db: AsyncSession = Depends(get_db_session)):
    """
    Returns pre-configured demo personas with 1-click login tokens for hackathon demos.
    """
    stmt = select(User).limit(10)
    res = await db.execute(stmt)
    users = res.scalars().all()

    personas = []
    for u in users:
        tokens = create_token_pair(u)
        personas.append({
            "id": u.id,
            "email": u.email,
            "fullName": u.full_name,
            "role": u.role,
            "company": u.company,
            "quickToken": tokens["accessToken"],
            "quickRefreshToken": tokens["refreshToken"],
        })

    return success_response(data={"personas": personas}, message="Available personas retrieved")


@router.post("/switch-persona")
async def switch_persona(req: SwitchPersonaRequest, db: AsyncSession = Depends(get_db_session)):
    """
    1-Click Persona Switcher endpoint. Quickly generates tokens for demo personas.
    """
    stmt = select(User)
    if req.email:
        stmt = stmt.where(User.email == req.email)
    elif req.role:
        stmt = stmt.where(User.role == req.role)
    else:
        stmt = stmt.where(User.role == RoleEnum.ADMIN.value)

    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        # Fallback to creating a quick persona if missing
        fallback_role = req.role or RoleEnum.ADMIN.value
        fallback_email = req.email or f"{fallback_role}@demo.internal"
        user = User(
            email=str(fallback_email),
            password_hash=hash_password("Demo@2026"),
            full_name=f"Demo {fallback_role.capitalize()}",
            role=fallback_role,
            company="Hackathon Demo Corp",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    tokens = create_token_pair(user)
    return success_response(data=tokens, message=f"Switched persona to {user.role} ({user.email})")
