import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assignmentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const assignment = await prisma.assignment.upsert({
    where: {
      teamMemberId_focusAreaId: {
        teamMemberId: parsed.data.teamMemberId,
        focusAreaId: parsed.data.focusAreaId,
      },
    },
    update: { role: parsed.data.role },
    create: parsed.data,
    include: { teamMember: true, focusArea: true },
  });
  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamMemberId = searchParams.get("teamMemberId");
  const focusAreaId = searchParams.get("focusAreaId");
  if (!teamMemberId || !focusAreaId) {
    return NextResponse.json(
      { error: "teamMemberId and focusAreaId required" },
      { status: 400 }
    );
  }
  await prisma.assignment.delete({
    where: { teamMemberId_focusAreaId: { teamMemberId, focusAreaId } },
  });
  return NextResponse.json({ success: true });
}
