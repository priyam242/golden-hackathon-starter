"""
Golden Hackathon Starter — S01 Core Sprint Module (Router)
Template CRUD routes for rapid hackathon feature prototyping.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db_session
from core.envelope import success_response, AppException
from modules.s01_core.models import SprintItem

router = APIRouter(prefix="/api/items", tags=["Sprint S01 Items"])


class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "active"


@router.get("")
async def list_items(db: AsyncSession = Depends(get_db_session)):
    stmt = select(SprintItem)
    res = await db.execute(stmt)
    items = res.scalars().all()
    return success_response(data=[i.to_dict() for i in items], message="Items retrieved")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_item(req: ItemCreate, db: AsyncSession = Depends(get_db_session)):
    item = SprintItem(title=req.title, description=req.description or "", status=req.status or "active")
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return success_response(data=item.to_dict(), message="Item created successfully", status_code=status.HTTP_201_CREATED)
