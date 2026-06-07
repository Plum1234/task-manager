"""SQLAlchemy ORM models and Pydantic schemas for tasks."""
from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

VALID_STATUSES = ("todo", "in_progress", "done")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="todo")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


# ---- Pydantic schemas ----
# NOTE: TaskCreate intentionally does not validate that title is non-empty.


class TaskCreate(BaseModel):
    title: str = ""
    description: str = ""
    status: str = "todo"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
