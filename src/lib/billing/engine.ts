import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import type {
  AccountSummaryDTO,
  ChargeDTO,
  InvoiceDTO,
  PaymentDTO,
} from "@/types/domain";
import { renderInvoiceHtml } from "./invoiceHtml";

export const KOPECKS_IN_RUB = 100;

export function rubToKop(rub: number): number {
  return Math.round(rub * KOPECKS_IN_RUB);
}

export function kopToRub(kop: number): number {
  return Math.round(kop) / KOPECKS_IN_RUB;
}

export function periodKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function periodEnd(period: string): Date {
  const parts = period.split("-").map(Number);
  const year = parts[0] ?? new Date().getUTCFullYear();
  const month = parts[1] ?? 1;
  return new Date(Date.UTC(year, month, 1));
}

export async function ensureAccountForOrg(organizationId: string) {
  const existing = await prisma.account.findUnique({ where: { organizationId } });
  if (existing) return existing;
  const count = await prisma.account.count();
  const number = `ЛС-${String(40000 + count + 1)}`;
  return prisma.account.create({
    data: {
      organizationId,
      number,
      balanceKop: 0,
      creditLimitKop: 0,
      billingMode: "postpay",
    },
  });
}

export async function getAccountSummary(organizationId: string): Promise<AccountSummaryDTO | null> {
  const acc = await prisma.account.findUnique({ where: { organizationId } });
  if (!acc) return null;

  const userServiceLink = await prisma.organizationMember.findFirst({
    where: { organizationId },
    select: { userId: true },
  });

  let monthlyChargeKop = 0;
  if (userServiceLink) {
    const services = await prisma.userService.findMany({
      where: { user: { memberships: { some: { organizationId } } }, status: "active" },
      select: { tariffSlug: true },
    });
    const slugs = Array.from(new Set(services.map((s) => s.tariffSlug)));
    if (slugs.length) {
      const tariffs = await prisma.tariff.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, priceRub: true },
      });
      const map = new Map(tariffs.map((t) => [t.slug, t.priceRub]));
      monthlyChargeKop = services.reduce(
        (sum, s) => sum + rubToKop(map.get(s.tariffSlug) ?? 0),
        0,
      );
    }
  }

  return {
    id: acc.id,
    number: acc.number,
    balanceKop: acc.balanceKop,
    creditLimitKop: acc.creditLimitKop,
    billingMode: acc.billingMode,
    currency: acc.currency,
    monthlyChargeKop,
  };
}

export async function listOrgInvoices(organizationId: string): Promise<InvoiceDTO[]> {
  const acc = await prisma.account.findUnique({ where: { organizationId } });
  if (!acc) return [];
  const rows = await prisma.invoice.findMany({
    where: { accountId: acc.id },
    orderBy: { issuedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    period: r.period,
    totalKop: r.totalKop,
    vatKop: r.vatKop,
    status: r.status as InvoiceDTO["status"],
    issuedAt: r.issuedAt.toISOString(),
    dueAt: r.dueAt.toISOString(),
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
  }));
}

export async function listOrgCharges(organizationId: string, limit = 50): Promise<ChargeDTO[]> {
  const acc = await prisma.account.findUnique({ where: { organizationId } });
  if (!acc) return [];
  const rows = await prisma.charge.findMany({
    where: { accountId: acc.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((c) => ({
    id: c.id,
    period: c.period,
    amountKop: c.amountKop,
    source: c.source,
    description: c.description,
    invoiceId: c.invoiceId,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function listOrgPayments(organizationId: string, limit = 50): Promise<PaymentDTO[]> {
  const acc = await prisma.account.findUnique({ where: { organizationId } });
  if (!acc) return [];
  const rows = await prisma.payment.findMany({
    where: { accountId: acc.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((p) => ({
    id: p.id,
    amountKop: p.amountKop,
    method: p.method,
    externalRef: p.externalRef,
    note: p.note,
    createdAt: p.createdAt.toISOString(),
  }));
}

interface RunBillingResult {
  invoicesCreated: number;
  chargesCreated: number;
  totalKop: number;
}

/**
 * Прогон ежемесячного начисления:
 *  - идёт по всем организациям с аккаунтом;
 *  - суммирует все active UserService у участников организации;
 *  - формирует Charge на каждый сервис, инвойс, списывает с баланса;
 *  - применяет накопленные неприменённые компенсации в этом периоде;
 *  - обновляет статусы прежних invoice (overdue).
 */
export async function runMonthlyBilling(periodArg?: string): Promise<RunBillingResult> {
  const period = periodArg ?? periodKey(new Date());
  const result: RunBillingResult = { invoicesCreated: 0, chargesCreated: 0, totalKop: 0 };
  const orgs = await prisma.organization.findMany({
    where: { status: "active", account: { isNot: null } },
    include: { account: true },
  });
  for (const org of orgs) {
    if (!org.account) continue;
    const billed = await runBillingForOrg(org.id, period);
    result.invoicesCreated += billed.invoiceCreated ? 1 : 0;
    result.chargesCreated += billed.chargesCreated;
    result.totalKop += billed.totalKop;
  }
  // mark overdue
  const now = new Date();
  await prisma.invoice.updateMany({
    where: { status: "issued", dueAt: { lt: now } },
    data: { status: "overdue" },
  });
  await recordAudit({
    action: "billing.monthly.run",
    payload: {
      period,
      invoicesCreated: result.invoicesCreated,
      chargesCreated: result.chargesCreated,
      totalKop: result.totalKop,
    },
  });
  return result;
}

interface OrgBillingResult {
  invoiceCreated: boolean;
  invoiceId?: string;
  chargesCreated: number;
  totalKop: number;
}

export async function runBillingForOrg(
  organizationId: string,
  period: string,
): Promise<OrgBillingResult> {
  const acc = await ensureAccountForOrg(organizationId);
  const existing = await prisma.invoice.findFirst({
    where: { accountId: acc.id, period },
  });
  if (existing) {
    return { invoiceCreated: false, invoiceId: existing.id, chargesCreated: 0, totalKop: 0 };
  }

  const services = await prisma.userService.findMany({
    where: { user: { memberships: { some: { organizationId } } }, status: "active" },
    include: {
      service: { select: { id: true, title: true } },
      site: { select: { id: true, title: true } },
    },
  });
  const tariffSlugs = Array.from(new Set(services.map((s) => s.tariffSlug)));
  const tariffs = tariffSlugs.length
    ? await prisma.tariff.findMany({
        where: { slug: { in: tariffSlugs } },
        select: { slug: true, title: true, priceRub: true },
      })
    : [];
  const tariffMap = new Map(tariffs.map((t) => [t.slug, t]));

  const items: { description: string; amountKop: number }[] = [];
  for (const s of services) {
    const t = tariffMap.get(s.tariffSlug);
    if (!t) continue;
    const amount = rubToKop(t.priceRub);
    const where = s.site?.title ? ` · ${s.site.title}` : "";
    items.push({
      description: `${s.service.title} — ${t.title}${where} (${period})`,
      amountKop: amount,
    });
  }

  // Compensation reversal
  const pendingCompensations = await prisma.compensation.findMany({
    where: { organizationId, period, applied: false },
    include: { incident: { select: { title: true } } },
  });
  const compItems = pendingCompensations.map((c) => ({
    description: `Компенсация SLA: ${c.incident.title}`,
    amountKop: -c.amountKop,
  }));

  const allItems = [...items, ...compItems];
  if (allItems.length === 0) {
    return { invoiceCreated: false, chargesCreated: 0, totalKop: 0 };
  }

  const totalKop = allItems.reduce((s, x) => s + x.amountKop, 0);
  const vatKop = Math.round((totalKop * 20) / 120); // 20% включённый НДС

  const invoiceCount = await prisma.invoice.count();
  const year = period.split("-")[0];
  const number = `СЧ-${year}-${String(invoiceCount + 1).padStart(6, "0")}`;
  const issuedAt = new Date();
  const dueAt = new Date(issuedAt.getTime() + 10 * 86400000);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      accountId: acc.id,
      period,
      totalKop,
      vatKop,
      status: "issued",
      issuedAt,
      dueAt,
    },
  });

  for (const item of items) {
    await prisma.charge.create({
      data: {
        accountId: acc.id,
        period,
        amountKop: item.amountKop,
        source: "subscription",
        description: item.description,
        invoiceId: invoice.id,
      },
    });
  }
  for (const c of pendingCompensations) {
    await prisma.charge.create({
      data: {
        accountId: acc.id,
        period,
        amountKop: -c.amountKop,
        source: "sla_compensation_reversal",
        description: `Компенсация SLA: ${c.incident.title}`,
        invoiceId: invoice.id,
      },
    });
    await prisma.compensation.update({
      where: { id: c.id },
      data: { applied: true },
    });
  }

  await prisma.account.update({
    where: { id: acc.id },
    data: { balanceKop: { decrement: totalKop } },
  });

  // Render snapshot
  const html = renderInvoiceHtml({
    number,
    period,
    issuedAt,
    dueAt,
    totalKop,
    vatKop,
    items: allItems,
    organizationId,
  });
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { htmlSnapshot: html },
  });

  return {
    invoiceCreated: true,
    invoiceId: invoice.id,
    chargesCreated: items.length + compItems.length,
    totalKop,
  };
}

export interface RecordPaymentInput {
  organizationId: string;
  amountKop: number;
  method: "bank_transfer" | "card" | "manual";
  externalRef?: string;
  note?: string;
  invoiceId?: string;
  actorId?: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  const acc = await ensureAccountForOrg(input.organizationId);
  const payment = await prisma.payment.create({
    data: {
      accountId: acc.id,
      amountKop: input.amountKop,
      method: input.method,
      externalRef: input.externalRef ?? null,
      note: input.note ?? null,
    },
  });
  await prisma.account.update({
    where: { id: acc.id },
    data: { balanceKop: { increment: input.amountKop } },
  });
  if (input.invoiceId) {
    const inv = await prisma.invoice.findUnique({ where: { id: input.invoiceId } });
    if (inv && inv.accountId === acc.id && inv.status !== "paid") {
      const accAfter = await prisma.account.findUnique({ where: { id: acc.id } });
      if (accAfter && accAfter.balanceKop >= 0) {
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { status: "paid", paidAt: new Date() },
        });
      }
    }
  } else {
    const accAfter = await prisma.account.findUnique({ where: { id: acc.id } });
    if (accAfter && accAfter.balanceKop >= 0) {
      await prisma.invoice.updateMany({
        where: { accountId: acc.id, status: { in: ["issued", "overdue"] } },
        data: { status: "paid", paidAt: new Date() },
      });
    }
  }
  await recordAudit({
    actorId: input.actorId,
    organizationId: input.organizationId,
    action: "billing.payment.create",
    targetType: "Payment",
    targetId: payment.id,
    payload: { amountKop: input.amountKop, method: input.method },
  });
  return payment;
}
