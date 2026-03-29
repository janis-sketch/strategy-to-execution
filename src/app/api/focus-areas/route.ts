import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { focusAreaSchema } from "@/lib/validators";

export async function GET() {
  const focusAreas = await prisma.focusArea.findMany({
    include: {
      goals: { include: { keyResults: true } },
      initiatives: { include: { tasks: true } },
      children: true,
      assignments: { include: { teamMember: true } },
      _count: { select: { goals: true, initiatives: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(focusAreas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = focusAreaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const focusArea = await prisma.focusArea.create({
    data: parsed.data,
  });
  return NextResponse.json(focusArea, { status: 201 });
}
