import { promises as fs } from "fs";
import path from "path";
import { STATUSES, type Task, type TaskStatus } from "@/api";

type TaskInput = {
  description?: unknown;
  status?: unknown;
  title?: unknown;
};

type TaskPatch = Partial<Pick<Task, "description" | "status" | "title">>;

const DATA_FILE =
  process.env.TASKS_DATA_FILE ?? path.join(process.cwd(), ".local", "tasks.json");
const SEED_FILE = path.join(process.cwd(), "data", "seed-tasks.json");

let writeQueue = Promise.resolve();

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && STATUSES.includes(value as TaskStatus);
}

function toTaskInput(body: unknown): TaskInput {
  if (!body || typeof body !== "object") {
    return {};
  }

  return body as TaskInput;
}

function normalizeCreateInput(body: unknown) {
  const input = toTaskInput(body);
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const status = input.status === undefined ? "todo" : input.status;

  if (!title) {
    throw new Error("A task title is required.");
  }

  if (!isTaskStatus(status)) {
    throw new Error("Task status must be todo, in_progress, or done.");
  }

  return { description, status, title };
}

function normalizePatch(body: unknown): TaskPatch {
  const input = toTaskInput(body);
  const patch: TaskPatch = {};

  if (input.title !== undefined) {
    if (typeof input.title !== "string" || !input.title.trim()) {
      throw new Error("A task title is required.");
    }

    patch.title = input.title.trim();
  }

  if (input.description !== undefined) {
    if (typeof input.description !== "string") {
      throw new Error("Task description must be text.");
    }

    patch.description = input.description.trim();
  }

  if (input.status !== undefined) {
    if (!isTaskStatus(input.status)) {
      throw new Error("Task status must be todo, in_progress, or done.");
    }

    patch.status = input.status;
  }

  return patch;
}

async function ensureStore() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    try {
      const seed = await fs.readFile(SEED_FILE, "utf8");
      await fs.writeFile(DATA_FILE, seed, "utf8");
    } catch {
      await fs.writeFile(DATA_FILE, "[]\n", "utf8");
    }
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as Task[];

  return parsed.sort((a, b) => a.id - b.id);
}

async function writeStore(tasks: Task[]) {
  await ensureStore();
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_FILE, `${JSON.stringify(tasks, null, 2)}\n`, "utf8")
  );

  await writeQueue;
}

export async function listTasks() {
  return readStore();
}

export async function createTask(body: unknown) {
  const input = normalizeCreateInput(body);
  const tasks = await readStore();
  const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    status: input.status,
    created_at: new Date().toISOString(),
  };

  await writeStore([...tasks, task]);
  return task;
}

export async function getTask(id: number) {
  const tasks = await readStore();
  return tasks.find((task) => task.id === id) ?? null;
}

export async function updateTask(id: number, body: unknown) {
  const patch = normalizePatch(body);
  const tasks = await readStore();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const task = { ...tasks[index], ...patch };
  const nextTasks = tasks.toSpliced(index, 1, task);

  await writeStore(nextTasks);
  return task;
}

export async function deleteTask(id: number) {
  const tasks = await readStore();
  const nextTasks = tasks.filter((task) => task.id !== id);

  if (nextTasks.length === tasks.length) {
    return false;
  }

  await writeStore(nextTasks);
  return true;
}
