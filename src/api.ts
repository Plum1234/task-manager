export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      // Some responses, like 204 deletes, do not include JSON bodies.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchTasks(signal?: AbortSignal): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`, { signal });
  return readJson<Task[]>(res);
}

export async function createTask(input: {
  title: string;
  description: string;
}): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<Task>(res);
}

export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "description" | "status">>
): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return readJson<Task>(res);
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new ApiError(`Delete failed with status ${res.status}`, res.status);
  }
}
