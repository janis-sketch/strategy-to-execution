import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { initiativeSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const focusAreaId = searchParams.get("focusAreaId");

  const where: Record<string, unknown> = {};
  if (focusAreaId) where.focusAreaId = focusAreaId;

  const initiatives = await prisma.initiative.findMany({
    where,
    include: {
      focusArea: true,
      tasks: true,
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(initiatives);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = initiativeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { startDate, endDate, ...rest } = parsed.data;
  const initiative = await prisma.initiative.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
    include: { focusArea: true },
  });
  return NextResponse.json(initiative, { status: 201 });
}
