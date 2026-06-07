"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  Search,
  Timer,
  type LucideIcon,
} from "lucide-react";
import {
  STATUS_LABEL,
  STATUSES,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/api";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { KanbanBoard } from "@/components/KanbanBoard";

type Filter = "all" | TaskStatus;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load(signal?: AbortSignal) {
    setIsLoading(true);
    setError("");

    try {
      const nextTasks = await fetchTasks(signal);
      setTasks(nextTasks);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") {
        return;
      }

      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    return STATUSES.reduce(
      (accumulator, status) => {
        accumulator[status] = tasks.filter((task) => task.status === status).length;
        return accumulator;
      },
      { todo: 0, in_progress: 0, done: 0 } satisfies Record<TaskStatus, number>
    );
  }, [tasks]);

  const completion = tasks.length
    ? Math.round((counts.done / tasks.length) * 100)
    : 0;

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, tasks]);

  async function handleCreate(title: string, description: string) {
    setIsCreating(true);
    setError("");
    setNotice("");

    try {
      await createTask({ title, description });
      await load();
      setNotice("Task added.");
    } catch (createError) {
      setError(getErrorMessage(createError));
      throw createError;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleMove(id: number, status: TaskStatus) {
    setBusyTaskId(id);
    setError("");
    setNotice("");

    try {
      await updateTask(id, { status });
      await load();
    } catch (moveError) {
      setError(getErrorMessage(moveError));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDelete(id: number) {
    setBusyTaskId(id);
    setError("");
    setNotice("");

    try {
      await deleteTask(id);
      await load();
      setNotice("Task deleted.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusyTaskId(null);
    }
  }

  const filterOptions: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
  ];

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white/85 p-5 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase text-teal-700">
              Demo Workspace
            </p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-950 sm:text-4xl">
              Task Manager
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Track the backlog, move work through review, and keep the current
              demo state visible.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Refresh
          </button>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <MetricCard
            icon={ClipboardList}
            label="Total"
            value={tasks.length}
            tone="zinc"
          />
          <MetricCard
            icon={Timer}
            label="In progress"
            value={counts.in_progress}
            tone="teal"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Done"
            value={counts.done}
            tone="emerald"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Completion"
            value={`${completion}%`}
            tone="amber"
          />
        </section>

        <CreateTaskForm isSubmitting={isCreating} onCreate={handleCreate} />

        <section className="rounded-lg border border-zinc-200 bg-white/85 p-4 shadow-panel backdrop-blur">
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks"
                className="h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                    filter === option.value
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {(error || notice) && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error ? (
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              {error || notice}
            </div>
          )}

          {isLoading && tasks.length === 0 ? (
            <div className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading tasks
              </div>
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              busyTaskId={busyTaskId}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "amber" | "emerald" | "teal" | "zinc";
  value: number | string;
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    teal: "bg-teal-50 text-teal-700",
    zinc: "bg-zinc-100 text-zinc-700",
  }[tone];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white/85 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-zinc-500">{label}</span>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${toneClass}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold text-zinc-950">{value}</div>
    </div>
  );
}
