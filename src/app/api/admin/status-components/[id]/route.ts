import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/log";
import { badRequest } from "@/lib/api/respond";

const schema = z.object({
  currentStatus: z
    .enum(["operational", "degraded", "partial_outage", "major_outage", "maintenance"])
    .optional(),
  name: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Неверные данные");
  const updated = await prisma.statusComponent.update({
    where: { id },
    data: parsed.data,
  });
  await recordAudit({
    actorId: admin.id,
    action: "status.component.update",
    targetType: "StatusComponent",
    targetId: id,
    payload: parsed.data,
  });
  return NextResponse.json({ component: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  await prisma.statusComponent.delete({ where: { id } });
  await recordAudit({
    actorId: admin.id,
    action: "status.component.delete",
    targetType: "StatusComponent",
    targetId: id,
  });
  return NextResponse.json({ ok: true });
}
