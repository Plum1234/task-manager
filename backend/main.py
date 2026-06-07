"""FastAPI task manager.

Demo target for "The Intern". A few rough edges are left in on purpose
(see the comments tagged INTENTIONAL GAP) so there is real work to pick up.
"""
from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Task, TaskCreate, TaskOut, TaskUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager", version="0.1.0")

# Wide-open CORS so the Vite dev server can talk to us during the demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    # INTENTIONAL GAP: returns every row, unbounded. No limit/offset pagination.
    return db.scalars(select(Task)).all()


@app.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    # INTENTIONAL GAP: no validation. An empty title is happily accepted.
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status or "todo",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    # INTENTIONAL GAP: no existence check. Deleting a missing/stale id passes
    # None to db.delete() and blows up with a 500 instead of a clean 404.
    task = db.get(Task, task_id)
    db.delete(task)
    db.commit()
    return None


# Serve the built Vite frontend (frontend/dist) when it exists, so a single
# FastAPI process serves both the API and the UI in production. Mounted last so
# the /tasks API routes above take precedence. In local dev the frontend runs
# separately via Vite, so this mount is simply skipped.
_FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if _FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=_FRONTEND_DIST, html=True), name="frontend")
