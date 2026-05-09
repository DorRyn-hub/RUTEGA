import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/log";
import { ensureAccountForOrg } from "@/lib/billing/engine";
import { badRequest } from "@/lib/api/respond";

const createSchema = z.object({
  inn: z.string().min(8).max(20),
  kpp: z.string().max(20).optional(),
  ogrn: z.string().max(20).optional(),
  legalName: z.string().min(2).max(200),
  shortName: z.string().max(120).optional(),
  legalAddress: z.string().min(2).max(500),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
  accountManagerId: z.string().optional(),
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
  const exists = await prisma.organization.findUnique({ where: { inn: parsed.data.inn } });
  if (exists) return badRequest("Организация с таким ИНН уже существует");
  const org = await prisma.organization.create({
    data: {
      inn: parsed.data.inn,
      kpp: parsed.data.kpp ?? null,
      ogrn: parsed.data.ogrn ?? null,
      legalName: parsed.data.legalName,
      shortName: parsed.data.shortName ?? null,
      legalAddress: parsed.data.legalAddress,
      contactEmail: parsed.data.contactEmail ?? null,
      contactPhone: parsed.data.contactPhone ?? null,
      accountManagerId: parsed.data.accountManagerId ?? null,
    },
  });
  await ensureAccountForOrg(org.id);
  await recordAudit({
    actorId: admin.id,
    organizationId: org.id,
    action: "org.create",
    targetType: "Organization",
    targetId: org.id,
    payload: { inn: org.inn, legalName: org.legalName },
  });
  return NextResponse.json({ org: { id: org.id } });
}
