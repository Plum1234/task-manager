import { useState } from "react";

interface Props {
  onCreate: (title: string, description: string) => void;
}

export function CreateTaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // INTENTIONAL GAP: no validation. We pass whatever is in the inputs,
    // including an empty title, then clear the form regardless.
    onCreate(title, description);
    setTitle("");
    setDescription("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-400">
        New task
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-700 bg-[#242424] px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-700"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-700 bg-[#242424] px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-700"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-white"
        >
          Add task
        </button>
      </div>
    </form>
  );
}
