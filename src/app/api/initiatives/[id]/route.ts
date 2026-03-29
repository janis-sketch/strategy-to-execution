import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { initiativeSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const initiative = await prisma.initiative.findUnique({
    where: { id },
    include: {
      focusArea: true,
      tasks: {
        include: { assignee: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!initiative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(initiative);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = initiativeSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { startDate, endDate, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (startDate !== undefined)
    data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined)
    data.endDate = endDate ? new Date(endDate) : null;
  const initiative = await prisma.initiative.update({
    where: { id },
    data,
    include: { focusArea: true, tasks: true },
  });
  return NextResponse.json(initiative);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.initiative.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
