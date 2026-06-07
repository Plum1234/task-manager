"use client";

import { Inbox } from "lucide-react";
import { STATUS_LABEL, STATUSES, type Task, type TaskStatus } from "@/api";
import { TaskCard } from "@/components/TaskCard";

interface Props {
  busyTaskId: number | null;
  tasks: Task[];
  onDelete: (id: number) => void;
  onMove: (id: number, status: TaskStatus) => void;
}

const COLUMN_STYLE: Record<TaskStatus, string> = {
  todo: "border-zinc-200 bg-zinc-50",
  in_progress: "border-teal-200 bg-teal-50/60",
  done: "border-emerald-200 bg-emerald-50/60",
};

const COUNT_STYLE: Record<TaskStatus, string> = {
  todo: "bg-zinc-200 text-zinc-700",
  in_progress: "bg-teal-100 text-teal-800",
  done: "bg-emerald-100 text-emerald-800",
};

export function KanbanBoard({ busyTaskId, tasks, onDelete, onMove }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {STATUSES.map((status) => {
        const items = tasks.filter((task) => task.status === status);

        return (
          <section
            key={status}
            className={`flex min-h-[360px] flex-col rounded-lg border p-3 ${COLUMN_STYLE[status]}`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase text-zinc-700">
                {STATUS_LABEL[status]}
              </h2>
              <span
                className={`inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-bold ${COUNT_STYLE[status]}`}
              >
                {items.length}
              </span>
            </div>

            <div className="grid flex-1 content-start gap-3">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isBusy={busyTaskId === task.id}
                  onDelete={onDelete}
                  onMove={onMove}
                />
              ))}

              {items.length === 0 && (
                <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-zinc-300 bg-white/60 px-4 text-center">
                  <div>
                    <Inbox
                      className="mx-auto h-6 w-6 text-zinc-400"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-medium text-zinc-500">
                      Empty
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
