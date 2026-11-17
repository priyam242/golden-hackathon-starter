"""
Golden Hackathon Starter — S01 Core Sprint Module (Models)
Template for rapid hackathon feature prototyping.
"""

import datetime
from typing import Dict, Any
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class SprintItem(Base):
    __tablename__ = "sprint_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
