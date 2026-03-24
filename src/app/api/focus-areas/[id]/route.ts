import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { focusAreaSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const focusArea = await prisma.focusArea.findUnique({
    where: { id },
    include: {
      goals: {
        include: { keyResults: true },
        orderBy: { createdAt: "asc" },
      },
      initiatives: {
        include: { tasks: true },
        orderBy: { createdAt: "asc" },
      },
      children: true,
      parent: true,
      assignments: { include: { teamMember: true } },
    },
  });
  if (!focusArea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(focusArea);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = focusAreaSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const focusArea = await prisma.focusArea.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(focusArea);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.focusArea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
