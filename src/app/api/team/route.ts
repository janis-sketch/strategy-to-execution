import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { teamMemberSchema } from "@/lib/validators";

export async function GET() {
  const members = await prisma.teamMember.findMany({
    include: {
      assignments: { include: { focusArea: true } },
      taskAssignments: { include: { initiative: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const member = await prisma.teamMember.create({
    data: parsed.data,
  });
  return NextResponse.json(member, { status: 201 });
}
