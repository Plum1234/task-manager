import type { Task, TaskStatus } from "../api";

interface Props {
  task: Task;
  onMove: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
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

export function TaskCard({ task, onMove, onDelete }: Props) {
  const next = NEXT[task.status];
  const prev = PREV[task.status];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      {/* An empty title renders as a blank line here — the "broken card". */}
      <div className="text-sm font-medium text-slate-900">{task.title}</div>
      {task.description && (
        <p className="mt-1 text-xs text-slate-500">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {prev && (
            <button
              onClick={() => onMove(task.id, prev)}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              ←
            </button>
          )}
          {next && (
            <button
              onClick={() => onMove(task.id, next)}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              →
            </button>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
