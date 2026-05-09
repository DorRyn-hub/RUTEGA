import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { resolveIncident } from "@/lib/sla/engine";
import { recordAudit } from "@/lib/audit/log";
import { badRequest, notFound } from "@/lib/api/respond";

const updateSchema = z
  .object({
    op: z.enum(["resolve", "update", "edit"]),
    message: z.string().max(2000).optional(),
    status: z
      .enum(["investigating", "identified", "monitoring", "resolved", "scheduled"])
      .optional(),
    publicRfo: z.string().max(5000).optional(),
    title: z.string().max(200).optional(),
    summary: z.string().max(2000).optional(),
    severity: z.enum(["minor", "major", "critical", "maintenance"]).optional(),
  });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const incident = await prisma.serviceIncident.findUnique({ where: { id } });
  if (!incident) return notFound();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Неверные данные");

  switch (parsed.data.op) {
    case "resolve":
      await resolveIncident({
        incidentId: id,
        publicRfo: parsed.data.publicRfo,
        actorId: admin.id,
      });
      break;
    case "update":
      await prisma.incidentUpdate.create({
        data: {
          incidentId: id,
          status: parsed.data.status ?? "monitoring",
          message: parsed.data.message ?? "",
        },
      });
      await recordAudit({
        actorId: admin.id,
        action: "sla.incident.update",
        targetType: "ServiceIncident",
        targetId: id,
        payload: { status: parsed.data.status },
      });
      break;
    case "edit":
      await prisma.serviceIncident.update({
        where: { id },
        data: {
          title: parsed.data.title ?? incident.title,
          summary: parsed.data.summary ?? incident.summary,
          severity: parsed.data.severity ?? incident.severity,
          publicRfo: parsed.data.publicRfo ?? incident.publicRfo,
        },
      });
      break;
  }
  return NextResponse.json({ ok: true });
}
