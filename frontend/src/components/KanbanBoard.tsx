import type { Task, TaskStatus } from "../api";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  onMove: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export function KanbanBoard({ tasks, onMove, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        // INTENTIONAL GAP: every matching task is rendered, no pagination /
        // "load more" controls. A large list just renders forever.
        const items = tasks.filter((t) => t.status === col.key);
        return (
          <section
            key={col.key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                {col.label}
              </h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              ))}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-slate-400">
                  Nothing here yet
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
