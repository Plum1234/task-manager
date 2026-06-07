"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus } from "lucide-react";

interface Props {
  isSubmitting: boolean;
  onCreate: (title: string, description: string) => Promise<void>;
}

export function CreateTaskForm({ isSubmitting, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError("A task title is required.");
      return;
    }

    setError("");

    try {
      await onCreate(cleanTitle, cleanDescription);
      setTitle("");
      setDescription("");
    } catch {
      // The dashboard owns API error messaging.
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-panel"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.8fr)_minmax(240px,1.3fr)_auto]">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase text-zinc-500">
            Task
          </span>
          <input
            type="text"
            placeholder="Write launch notes"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error) {
                setError("");
              }
            }}
            className="h-11 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase text-zinc-500">
            Notes
          </span>
          <input
            type="text"
            placeholder="Add context, owner, or acceptance criteria"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-11 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Add
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
