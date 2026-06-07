"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Loader2,
  Timer,
  Trash2,
} from "lucide-react";
import type { Task, TaskStatus } from "@/api";

interface Props {
  task: Task;
  isBusy: boolean;
  onDelete: (id: number) => void;
  onMove: (id: number, status: TaskStatus) => void;
}

const NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

const PREV: Record<TaskStatus, TaskStatus | null> = {
  todo: null,
  in_progress: "todo",
  done: "in_progress",
};

const STATUS_ICON = {
  todo: Circle,
  in_progress: Timer,
  done: CheckCircle2,
} satisfies Record<TaskStatus, typeof Circle>;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "New";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function TaskCard({ task, isBusy, onDelete, onMove }: Props) {
  const next = NEXT[task.status];
  const prev = PREV[task.status];
  const StatusIcon = STATUS_ICON[task.status];

  return (
    <article className="group rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <StatusIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-zinc-950">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 break-words text-sm leading-5 text-zinc-600">
              {task.description}
            </p>
          ) : (
            <p className="mt-1 text-sm italic leading-5 text-zinc-400">
              No notes
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatDate(task.created_at)}
        </span>

        <div className="flex items-center gap-1">
          {prev && (
            <button
              type="button"
              title="Move back"
              disabled={isBusy}
              onClick={() => onMove(task.id, prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Move back</span>
            </button>
          )}
          {next && (
            <button
              type="button"
              title="Move forward"
              disabled={isBusy}
              onClick={() => onMove(task.id, next)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Move forward</span>
            </button>
          )}
          <button
            type="button"
            title="Delete task"
            disabled={isBusy}
            onClick={() => onDelete(task.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">Delete task</span>
          </button>
        </div>
      </div>
    </article>
  );
}
