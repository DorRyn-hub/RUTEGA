import "server-only";
import { prisma } from "@/lib/prisma";
import { rubToKop, periodKey } from "@/lib/billing/engine";
import { recordAudit } from "@/lib/audit/log";
import type { IncidentDTO, StatusComponentDTO } from "@/types/domain";

const HOURS_IN_MONTH = 24 * 30;

export function calculateUptime(downtimeMinutes: number, periodHours = HOURS_IN_MONTH): number {
  const total = periodHours * 60;
  if (total <= 0) return 100;
  const up = Math.max(0, total - downtimeMinutes);
  return Math.round((up / total) * 10000) / 100;
}

export interface CompensationRule {
  threshold: number;        // ниже какого uptime% начислять компенсацию
  refundPercent: number;    // сколько % от месячного платежа вернуть
}

const DEFAULT_RULES: CompensationRule[] = [
  { threshold: 99.0, refundPercent: 5 },
  { threshold: 98.0, refundPercent: 10 },
  { threshold: 95.0, refundPercent: 25 },
  { threshold: 90.0, refundPercent: 50 },
];

export function compensationPercent(uptime: number, rules = DEFAULT_RULES): number {
  let pct = 0;
  for (const r of rules) {
    if (uptime < r.threshold) pct = Math.max(pct, r.refundPercent);
  }
  return pct;
}

interface ResolveIncidentInput {
  incidentId: string;
  resolvedAt?: Date;
  publicRfo?: string;
  actorId?: string;
}

/**
 * Закрытие инцидента → пересчёт downtime → начисление компенсаций затронутым организациям.
 */
export async function resolveIncident(input: ResolveIncidentInput) {
  const incident = await prisma.serviceIncident.findUnique({
    where: { id: input.incidentId },
    include: { service: { include: { tariffs: true } } },
  });
  if (!incident) throw new Error("Инцидент не найден");
  if (incident.resolvedAt) return incident;

  const resolvedAt = input.resolvedAt ?? new Date();
  const downtimeMinutes = Math.max(
    0,
    Math.round((resolvedAt.getTime() - incident.startedAt.getTime()) / 60000),
  );

  await prisma.serviceIncident.update({
    where: { id: incident.id },
    data: {
      resolvedAt,
      publicRfo: input.publicRfo ?? incident.publicRfo,
    },
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: incident.id,
      status: "resolved",
      message: input.publicRfo ?? "Инцидент решён, сервис восстановлен.",
    },
  });

  // Update component statuses
  const slugs = safeSlugs(incident.componentSlugs);
  if (slugs.length) {
    await prisma.statusComponent.updateMany({
      where: { slug: { in: slugs } },
      data: { currentStatus: "operational" },
    });
  }

  // Calc compensations
  const uptime = calculateUptime(downtimeMinutes);
  const refundPct = compensationPercent(uptime);
  const period = periodKey(resolvedAt);
  let comps = 0;

  if (refundPct > 0 && incident.serviceId) {
    const affected = safeSlugs(incident.affectedOrgIds);
    const targetOrgs = affected.length
      ? await prisma.organization.findMany({ where: { id: { in: affected } } })
      : await prisma.organization.findMany({
          where: {
            members: {
              some: {
                user: {
                  services: {
                    some: { serviceId: incident.serviceId, status: "active" },
                  },
                },
              },
            },
          },
        });

    for (const org of targetOrgs) {
      const tariffs = await prisma.tariff.findMany({
        where: {
          slug: {
            in: (
              await prisma.userService.findMany({
                where: {
                  user: { memberships: { some: { organizationId: org.id } } },
                  serviceId: incident.serviceId,
                  status: "active",
                },
                select: { tariffSlug: true },
              })
            ).map((s) => s.tariffSlug),
          },
        },
        select: { priceRub: true },
      });
      const monthlyKop = tariffs.reduce((s, t) => s + rubToKop(t.priceRub), 0);
      if (monthlyKop <= 0) continue;
      const compKop = Math.round((monthlyKop * refundPct) / 100);
      try {
        await prisma.compensation.create({
          data: {
            incidentId: incident.id,
            organizationId: org.id,
            period,
            amountKop: compKop,
            reason: `Простой ${downtimeMinutes} мин · ${incident.service?.title ?? "услуга"} · возврат ${refundPct}%`,
          },
        });
        comps += 1;
      } catch {
        // если уже есть компенсация по этой паре — ок
      }
    }
  }

  await recordAudit({
    actorId: input.actorId,
    action: "sla.incident.resolved",
    targetType: "ServiceIncident",
    targetId: incident.id,
    payload: {
      downtimeMinutes,
      uptime,
      refundPct,
      compensationsCreated: comps,
    },
  });

  return prisma.serviceIncident.findUnique({ where: { id: incident.id } });
}

function safeSlugs(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  } catch {}
  return [];
}

export async function listIncidents(params: {
  serviceId?: string;
  open?: boolean;
  limit?: number;
}): Promise<IncidentDTO[]> {
  const where: Record<string, unknown> = {};
  if (params.serviceId) where.serviceId = params.serviceId;
  if (params.open === true) where.resolvedAt = null;
  if (params.open === false) where.resolvedAt = { not: null };

  const rows = await prisma.serviceIncident.findMany({
    where,
    orderBy: [{ resolvedAt: "asc" }, { startedAt: "desc" }],
    take: params.limit ?? 30,
    include: {
      service: { select: { title: true } },
      updates: { orderBy: { createdAt: "asc" } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    serviceId: r.serviceId,
    serviceTitle: r.service?.title ?? null,
    title: r.title,
    summary: r.summary,
    severity: r.severity as IncidentDTO["severity"],
    componentSlugs: safeSlugs(r.componentSlugs),
    affectedOrgIds: safeSlugs(r.affectedOrgIds),
    startedAt: r.startedAt.toISOString(),
    resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
    publicRfo: r.publicRfo,
    isPublic: r.isPublic,
    updates: r.updates.map((u) => ({
      id: u.id,
      status: u.status,
      message: u.message,
      createdAt: u.createdAt.toISOString(),
    })),
  }));
}

export async function listStatusComponents(): Promise<StatusComponentDTO[]> {
  const rows = await prisma.statusComponent.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    group: r.group,
    currentStatus: r.currentStatus as StatusComponentDTO["currentStatus"],
    order: r.order,
  }));
}

export async function getOverallStatus(): Promise<{
  level: StatusComponentDTO["currentStatus"];
  label: string;
}> {
  const rows = await prisma.statusComponent.findMany({ select: { currentStatus: true } });
  const order = ["operational", "maintenance", "degraded", "partial_outage", "major_outage"];
  let worst: StatusComponentDTO["currentStatus"] = "operational";
  for (const r of rows) {
    if (order.indexOf(r.currentStatus) > order.indexOf(worst)) {
      worst = r.currentStatus as StatusComponentDTO["currentStatus"];
    }
  }
  const labels: Record<StatusComponentDTO["currentStatus"], string> = {
    operational: "Все системы работают штатно",
    maintenance: "Запланированные работы",
    degraded: "Частичные деградации",
    partial_outage: "Частичный сбой",
    major_outage: "Крупный сбой",
  };
  return { level: worst, label: labels[worst] };
}
