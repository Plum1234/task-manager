export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
}

// Same-origin: the Vite dev server proxies /tasks to the FastAPI backend
// (see vite.config.ts). This works locally and behind Replit's proxy.
const API_BASE = "";

// NOTE: These helpers intentionally have no error handling. Failed requests
// just reject/throw and the UI swallows it (see App.tsx) — silent failures.

export async function fetchTasks(): Promise<Task[]> {
  // INTENTIONAL GAP: loads everything, no pagination params.
  const res = await fetch(`${API_BASE}/tasks`);
  return res.json();
}

export async function createTask(input: {
  title: string;
  description: string;
}): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "description" | "status">>
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
}
