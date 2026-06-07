import { NextResponse } from "next/server";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getTaskId(context: RouteContext) {
  const { id } = await context.params;
  const taskId = Number(id);

  if (!Number.isInteger(taskId) || taskId < 1) {
    return null;
  }

  return taskId;
}

export async function GET(_request: Request, context: RouteContext) {
  const taskId = await getTaskId(context);

  if (!taskId) {
    return NextResponse.json({ detail: "Task not found" }, { status: 404 });
  }

  const task = await getTask(taskId);

  if (!task) {
    return NextResponse.json({ detail: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(request: Request, context: RouteContext) {
  const taskId = await getTaskId(context);

  if (!taskId) {
    return NextResponse.json({ detail: "Task not found" }, { status: 404 });
  }

  try {
    const task = await updateTask(taskId, await request.json());

    if (!task) {
      return NextResponse.json({ detail: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Invalid task." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const taskId = await getTaskId(context);

  if (!taskId) {
    return NextResponse.json({ detail: "Task not found" }, { status: 404 });
  }

  const deleted = await deleteTask(taskId);

  if (!deleted) {
    return NextResponse.json({ detail: "Task not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
