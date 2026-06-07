# Task Manager

A root-level Next.js + TypeScript + Tailwind task manager, with Bun as the
package manager and Next API routes for the backend.

## Project structure

```text
src/
  app/
    api/tasks/        # REST API route handlers
    globals.css
    layout.tsx
    page.tsx
  components/         # Dashboard, board, form, and task cards
  lib/tasks.ts        # Local task data access and validation
  api.ts              # Browser API client
data/tasks.json       # Demo data store
scripts/seed_linear.py
```

## Running the app

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## API

The frontend and backend run from the same Next.js app.

| Method | Path              | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/api/tasks`      | List all tasks    |
| POST   | `/api/tasks`      | Create a task     |
| GET    | `/api/tasks/{id}` | Get a single task |
| PUT    | `/api/tasks/{id}` | Update a task     |
| DELETE | `/api/tasks/{id}` | Delete a task     |

Task model: `id, title, description, status (todo/in_progress/done), created_at`.

## Building

```bash
bun run build
```

## Data

The demo data lives in `data/tasks.json`. Set `TASKS_DATA_FILE` if you want the
Next API routes to read and write a different JSON file.
