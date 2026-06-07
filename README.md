# Task Manager — a demo target for **The Intern**

A deliberately small full-stack task manager: a FastAPI + SQLite backend and a
React + Vite + Tailwind kanban board. It exists to give **The Intern** — an
always-on AI teammate that lives in Slack, triages Linear tickets, writes code
on feature branches, and opens GitHub PRs (but **never merges without explicit
human approval**) — something real to work on.

The app works, looks demo-worthy, and has a handful of **intentional gaps**
left in plain sight so the Intern has obvious tickets to pick up.

## Project structure

```
backend/
  main.py            # FastAPI app + endpoints
  models.py          # SQLAlchemy model + Pydantic schemas
  database.py        # SQLite engine / session
  requirements.txt
  tests/
    test_tasks.py    # happy-path tests
    conftest.py      # test DB fixture
frontend/
  src/
    App.tsx
    api.ts
    components/
      KanbanBoard.tsx
      TaskCard.tsx
      CreateTaskForm.tsx
scripts/
  seed_linear.py     # creates the demo backlog in Linear
.env.example
README.md
```

## Running the backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # or reuse the repo .venv
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API is then at `http://localhost:8000` (interactive docs at `/docs`).

### Endpoints

| Method | Path           | Description            |
| ------ | -------------- | ---------------------- |
| GET    | `/tasks`       | List all tasks         |
| GET    | `/tasks/{id}`  | Get a single task      |
| POST   | `/tasks`       | Create a task          |
| PUT    | `/tasks/{id}`  | Update a task          |
| DELETE | `/tasks/{id}`  | Delete a task          |

Task model: `id, title, description, status (todo/in_progress/done), created_at`.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. It expects the backend at `http://localhost:8000`.

## Running the tests

```bash
cd backend
pytest -q
```

## Seeding Linear

```bash
cp .env.example .env   # fill in LINEAR_API_KEY and LINEAR_TEAM_ID
set -a && source .env && set +a
python scripts/seed_linear.py
```

This creates exactly five issues (and any missing labels) on the target team,
printing each issue's ID + URL and a final summary table.

## Intentional gaps (a.k.a. the backlog)

These are **left in on purpose** and map directly to the seeded Linear tickets:

**Backend**
- `DELETE /tasks/{id}` on a nonexistent ID returns **500 instead of 404**.
- `POST /tasks` accepts an **empty string for the title**.
- `GET /tasks` returns **all rows, unbounded** (no pagination).

**Frontend**
- No **pagination controls** on the board.
- Creating a task with an **empty title** silently creates a broken/blank card.

**Tests**
- No test for invalid input on `POST`.
- No test for deleting a nonexistent task.

> The clean one-liner for a demo: the Intern reads the board, picks
> *"Deleting a missing task throws a server error"*, returns a 404 instead of a
> 500, the board stops showing a broken state on double-delete, tests go green,
> and a PR opens — awaiting human approval.
