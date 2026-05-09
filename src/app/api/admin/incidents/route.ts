import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/log";
import { badRequest } from "@/lib/api/respond";

const createSchema = z.object({
  serviceId: z.string().optional(),
  title: z.string().min(3).max(200),
  summary: z.string().min(3).max(2000),
  severity: z.enum(["minor", "major", "critical", "maintenance"]).optional(),
  componentSlugs: z.array(z.string()).optional(),
  affectedOrgIds: z.array(z.string()).optional(),
  startedAt: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Неверные данные");
  const incident = await prisma.serviceIncident.create({
    data: {
      serviceId: parsed.data.serviceId ?? null,
      title: parsed.data.title,
      summary: parsed.data.summary,
      severity: parsed.data.severity ?? "minor",
      componentSlugs: JSON.stringify(parsed.data.componentSlugs ?? []),
      affectedOrgIds: JSON.stringify(parsed.data.affectedOrgIds ?? []),
      startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date(),
      isPublic: parsed.data.isPublic ?? true,
    },
  });
  if (parsed.data.componentSlugs && parsed.data.componentSlugs.length) {
    const newStatus =
      parsed.data.severity === "maintenance"
        ? "maintenance"
        : parsed.data.severity === "minor"
          ? "degraded"
          : parsed.data.severity === "major"
            ? "partial_outage"
            : "major_outage";
    await prisma.statusComponent.updateMany({
      where: { slug: { in: parsed.data.componentSlugs } },
      data: { currentStatus: newStatus },
    });
  }
  await recordAudit({
    actorId: admin.id,
    action: "sla.incident.create",
    targetType: "ServiceIncident",
    targetId: incident.id,
    payload: { severity: parsed.data.severity ?? "minor" },
  });
  return NextResponse.json({ incident: { id: incident.id } });
}
