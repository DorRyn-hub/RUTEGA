import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuditLogDTO } from "@/types/domain";

export interface AuditEntryInput {
  actorId?: string | null;
  organizationId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

async function readClientMeta(): Promise<{ ip: string | null; userAgent: string | null }> {
  try {
    const h = await headers();
    const ipFwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = h.get("x-real-ip");
    const ua = h.get("user-agent");
    return {
      ip: ipFwd ?? realIp ?? null,
      userAgent: ua ?? null,
    };
  } catch {
    return { ip: null, userAgent: null };
  }
}

export async function recordAudit(entry: AuditEntryInput): Promise<void> {
  const meta = await readClientMeta();
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      organizationId: entry.organizationId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      ip: entry.ip ?? meta.ip,
      userAgent: entry.userAgent ?? meta.userAgent,
      payload: entry.payload ? JSON.stringify(entry.payload) : null,
    },
  });
}

interface QueryParams {
  organizationId?: string;
  actorId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export async function queryAuditLog(params: QueryParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(200, Math.max(1, params.limit ?? 50));
  const where: Record<string, unknown> = {};
  if (params.organizationId) where.organizationId = params.organizationId;
  if (params.actorId) where.actorId = params.actorId;
  if (params.action) where.action = { contains: params.action };

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { actor: { select: { id: true, fullName: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const items: AuditLogDTO[] = rows.map((r) => ({
    id: r.id,
    actorId: r.actorId,
    actorName: r.actor ? r.actor.fullName : null,
    organizationId: r.organizationId,
    action: r.action,
    targetType: r.targetType,
    targetId: r.targetId,
    ip: r.ip,
    payload: r.payload ? safeParse(r.payload) : null,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, total, page, limit };
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(s);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}
