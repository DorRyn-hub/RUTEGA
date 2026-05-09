import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { addTicketMessage, assignTicket, changeTicketStatus, getTicket } from "@/lib/tickets/engine";
import { badRequest, notFound } from "@/lib/api/respond";

const schema = z
  .object({
    body: z.string().max(5000).optional(),
    isInternal: z.boolean().optional(),
    status: z
      .enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
      .optional(),
    assignedToId: z.string().nullable().optional(),
  })
  .refine(
    (v) => v.body || v.status || v.assignedToId !== undefined,
    { message: "Действие не определено" },
  );

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const ticket = await getTicket(id);
  if (!ticket) return notFound();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Неверные данные");

  if (parsed.data.body) {
    await addTicketMessage({
      ticketId: id,
      authorId: admin.id,
      body: parsed.data.body,
      isInternal: parsed.data.isInternal ?? false,
      authorIsCustomer: false,
    });
  }
  if (parsed.data.status) {
    await changeTicketStatus({ ticketId: id, status: parsed.data.status, actorId: admin.id });
  }
  if (parsed.data.assignedToId !== undefined) {
    await assignTicket(id, parsed.data.assignedToId, admin.id);
  }
  return NextResponse.json({ ok: true });
}
