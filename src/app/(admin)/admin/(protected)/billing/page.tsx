import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPeriod, formatKopAsRub } from "@/lib/format";
import { RunAllBillingButton } from "./RunAllBillingButton";

export const metadata: Metadata = {
  title: "Админ · Биллинг",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const [accounts, recentInvoices, agg] = await Promise.all([
    prisma.account.findMany({
      include: {
        organization: { select: { id: true, legalName: true, shortName: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      take: 30,
      include: { account: { include: { organization: { select: { legalName: true, shortName: true, id: true } } } } },
    }),
    prisma.invoice.aggregate({
      _sum: { totalKop: true },
      where: { status: "paid" },
    }),
  ]);

  const overdue = recentInvoices.filter((i) => i.status === "overdue").length;
  const issued = recentInvoices.filter((i) => i.status === "issued").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Биллинг"
        description="Лицевые счета организаций, инвойсы и операции."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Оплачено всего</p>
          <p className="mt-1 text-2xl font-bold">{formatKopAsRub(agg._sum.totalKop ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Выставлено / просрочено</p>
          <p className="mt-1 text-2xl font-bold">
            {issued} / <span className="text-[var(--color-danger)]">{overdue}</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Прогон биллинга</p>
          <RunAllBillingButton />
        </Card>
      </div>

      <Card className="admin-table p-0">
        <div className="border-b px-5 py-3 font-semibold">Лицевые счета</div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">№</th>
              <th className="px-5 py-3 font-medium">Организация</th>
              <th className="px-5 py-3 font-medium">Баланс</th>
              <th className="px-5 py-3 font-medium">Кредитный лимит</th>
              <th className="px-5 py-3 font-medium">Режим</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{a.number}</td>
                <td className="px-5 py-3">
                  <a href={`/admin/organizations/${a.organization.id}`} className="font-medium hover:underline">
                    {a.organization.shortName ?? a.organization.legalName}
                  </a>
                </td>
                <td
                  className={
                    "px-5 py-3 font-semibold " +
                    (a.balanceKop < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]")
                  }
                >
                  {formatKopAsRub(a.balanceKop)}
                </td>
                <td className="px-5 py-3">{formatKopAsRub(a.creditLimitKop)}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">{a.billingMode}</td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Лицевых счетов нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="admin-table p-0">
        <div className="border-b px-5 py-3 font-semibold">Последние счета</div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">№</th>
              <th className="px-5 py-3 font-medium">Период</th>
              <th className="px-5 py-3 font-medium">Организация</th>
              <th className="px-5 py-3 font-medium">Сумма</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Срок</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{inv.number}</td>
                <td className="px-5 py-3">{formatPeriod(inv.period)}</td>
                <td className="px-5 py-3 text-xs">
                  {inv.account.organization.shortName ?? inv.account.organization.legalName}
                </td>
                <td className="px-5 py-3 font-semibold">{formatKopAsRub(inv.totalKop)}</td>
                <td className="px-5 py-3">
                  <Badge
                    tone={
                      inv.status === "paid"
                        ? "success"
                        : inv.status === "overdue"
                          ? "danger"
                          : "warn"
                    }
                  >
                    {inv.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(inv.dueAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
