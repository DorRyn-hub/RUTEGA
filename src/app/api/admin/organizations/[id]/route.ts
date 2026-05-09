import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/log";
import { ensureAccountForOrg } from "@/lib/billing/engine";
import { badRequest, notFound } from "@/lib/api/respond";

const updateSchema = z.object({
  legalName: z.string().max(200).optional(),
  shortName: z.string().max(120).optional(),
  inn: z.string().max(20).optional(),
  kpp: z.string().max(20).optional(),
  ogrn: z.string().max(20).optional(),
  legalAddress: z.string().max(500).optional(),
  postalAddress: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional(),
  status: z.enum(["active", "suspended", "archived"]).optional(),
  twoFactorRequired: z.boolean().optional(),
  accountManagerId: z.string().nullable().optional(),
  creditLimitKop: z.number().int().nonnegative().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return notFound();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Неверные данные");
  const data = parsed.data;
  await prisma.organization.update({
    where: { id },
    data: {
      ...(data.legalName !== undefined && { legalName: data.legalName }),
      ...(data.shortName !== undefined && { shortName: data.shortName }),
      ...(data.inn !== undefined && { inn: data.inn }),
      ...(data.kpp !== undefined && { kpp: data.kpp }),
      ...(data.ogrn !== undefined && { ogrn: data.ogrn }),
      ...(data.legalAddress !== undefined && { legalAddress: data.legalAddress }),
      ...(data.postalAddress !== undefined && { postalAddress: data.postalAddress }),
      ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
      ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.twoFactorRequired !== undefined && { twoFactorRequired: data.twoFactorRequired }),
      ...(data.accountManagerId !== undefined && { accountManagerId: data.accountManagerId }),
    },
  });
  if (data.creditLimitKop !== undefined) {
    const acc = await ensureAccountForOrg(id);
    await prisma.account.update({
      where: { id: acc.id },
      data: { creditLimitKop: data.creditLimitKop },
    });
  }
  await recordAudit({
    actorId: admin.id,
    organizationId: id,
    action: "org.update",
    targetType: "Organization",
    targetId: id,
    payload: data,
  });
  return NextResponse.json({ ok: true });
}
