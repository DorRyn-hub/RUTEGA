import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { createTicket } from "@/lib/tickets/engine";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(3).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  category: z.enum(["general", "technical", "billing", "sales", "sla"]).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const ctx = await requireOrgPermission("tickets.write");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Заполните тему и сообщение");
  }
  const ticket = await createTicket({
    organizationId: ctx.org.id,
    openedById: user.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
    priority: parsed.data.priority,
    category: parsed.data.category,
  });
  return NextResponse.json({ ticket: { id: ticket.id, number: ticket.number } });
}
