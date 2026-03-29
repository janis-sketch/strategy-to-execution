import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { goalSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const focusAreaId = searchParams.get("focusAreaId");
  const parentGoalId = searchParams.get("parentGoalId");

  const where: Record<string, unknown> = {};
  if (focusAreaId) where.focusAreaId = focusAreaId;
  if (parentGoalId) where.parentGoalId = parentGoalId;

  const goals = await prisma.goal.findMany({
    where,
    include: {
      focusArea: true,
      keyResults: true,
      parentGoal: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { dueDate, ...rest } = parsed.data;
  const goal = await prisma.goal.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { focusArea: true, keyResults: true },
  });
  return NextResponse.json(goal, { status: 201 });
}
