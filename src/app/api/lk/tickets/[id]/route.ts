import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { addTicketMessage, changeTicketStatus, getTicket } from "@/lib/tickets/engine";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api/respond";

const schema = z
  .object({
    body: z.string().min(2).max(5000).optional(),
    status: z
      .enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
      .optional(),
  })
  .refine((v) => v.body || v.status, { message: "Нужно указать сообщение или статус" });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const orgCtx = await requireOrgPermission("tickets.write");
  const { id } = await ctx.params;
  const ticket = await getTicket(id);
  if (!ticket) return notFound();
  if (ticket.organizationId !== orgCtx.org.id) return forbidden();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Неверные данные");

  if (parsed.data.body) {
    await addTicketMessage({
      ticketId: id,
      authorId: user.id,
      body: parsed.data.body,
      authorIsCustomer: true,
    });
  }
  if (parsed.data.status) {
    await changeTicketStatus({ ticketId: id, status: parsed.data.status, actorId: user.id });
  }
  return NextResponse.json({ ok: true });
}
