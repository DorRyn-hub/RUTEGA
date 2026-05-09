import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authV1 } from "@/lib/api/v1Auth";
import { listOrgTickets, createTicket } from "@/lib/tickets/engine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authV1(req, "read");
  if (!auth.ok) return auth.res;
  const tickets = await listOrgTickets(auth.ctx.organizationId);
  return NextResponse.json({ tickets });
}

const createSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(3).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  category: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authV1(req, "tickets");
  if (!auth.ok) return auth.res;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const member = await prisma.organizationMember.findFirst({
    where: { organizationId: auth.ctx.organizationId },
    orderBy: { invitedAt: "asc" },
    select: { userId: true },
  });
  if (!member) {
    return NextResponse.json({ error: "no_member_to_attribute" }, { status: 422 });
  }
  const ticket = await createTicket({
    organizationId: auth.ctx.organizationId,
    openedById: member.userId,
    subject: parsed.data.subject,
    body: parsed.data.body,
    priority: parsed.data.priority,
    category: parsed.data.category,
  });
  return NextResponse.json({ ticket: { id: ticket.id, number: ticket.number } }, { status: 201 });
}
