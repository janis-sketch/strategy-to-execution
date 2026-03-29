import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { taskSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const initiativeId = searchParams.get("initiativeId");

  const where: Record<string, unknown> = {};
  if (initiativeId) where.initiativeId = initiativeId;

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: true, initiative: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { dueDate, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignee: true },
  });
  return NextResponse.json(task, { status: 201 });
}
