import { NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/tasks";

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const task = await createTask(await request.json());
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Invalid task." },
      { status: 400 }
    );
  }
}
