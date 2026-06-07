import { useEffect, useState } from "react";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { KanbanBoard } from "./components/KanbanBoard";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api";
import type { Task, TaskStatus } from "./api";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    // INTENTIONAL GAP: no try/catch. If this throws, it fails silently and the
    // board just stays empty with no error state shown to the user.
    const data = await fetchTasks();
    setTasks(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(title: string, description: string) {
    // INTENTIONAL GAP: no client-side validation. An empty title is sent
    // straight to the API, which accepts it and renders a broken/blank card.
    await createTask({ title, description });
    await load();
  }

  async function handleMove(id: number, status: TaskStatus) {
    await updateTask(id, { status });
    await load();
  }

  async function handleDelete(id: number) {
    await deleteTask(id);
    await load();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-neutral-800 dark:bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              Task Manager
            </h1>
            <p className="text-sm text-slate-500 dark:text-neutral-400">
              A simple kanban board for managing tasks.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="mt-1 rounded-md px-3 py-1.5 text-sm font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <CreateTaskForm onCreate={handleCreate} />
        <div className="mt-8">
          <KanbanBoard
            tasks={tasks}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
