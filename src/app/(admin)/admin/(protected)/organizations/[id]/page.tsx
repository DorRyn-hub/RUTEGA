import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOrgById, getOrgMembers, getOrgSites } from "@/lib/org/repos";
import { getAccountSummary, listOrgInvoices } from "@/lib/billing/engine";
import { ORG_ROLE_LABELS } from "@/lib/auth/permissions";
import { formatKopAsRub, formatPeriod, formatDateTime } from "@/lib/format";
import { OrgEditForm } from "./OrgEditForm";
import { RunBillingButton } from "./RunBillingButton";

export const metadata: Metadata = {
  title: "Админ · Организация",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrganizationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrgById(id);
  if (!org) notFound();
  const [members, sites, account, invoices] = await Promise.all([
    getOrgMembers(id),
    getOrgSites(id),
    getAccountSummary(id),
    listOrgInvoices(id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={org.legalName} description={`ИНН ${org.inn} · ${org.legalAddress}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-muted)]">ЛС</p>
          <p className="mt-1 font-mono">{account?.number ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Баланс</p>
          <p
            className={
              "mt-1 text-2xl font-bold " +
              ((account?.balanceKop ?? 0) < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]")
            }
          >
            {account ? formatKopAsRub(account.balanceKop) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Месячный платёж</p>
          <p className="mt-1 text-2xl font-bold">
            {account ? formatKopAsRub(account.monthlyChargeKop) : "—"}
          </p>
          <RunBillingButton organizationId={org.id} />
        </Card>
      </div>

      <OrgEditForm org={org} accountSummary={account} />

      <Card>
        <h2 className="font-semibold">Сотрудники</h2>
        <ul className="mt-3 divide-y">
          {members.map((m) => (
            <li key={m.id} className="flex justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{m.fullName}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {m.email}
                  {m.position ? ` · ${m.position}` : ""}
                </p>
              </div>
              <Badge tone="info">{ORG_ROLE_LABELS[m.role]}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">Площадки</h2>
        <ul className="mt-3 divide-y">
          {sites.map((s) => (
            <li key={s.id} className="flex justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-[var(--color-muted)]">{s.address}</p>
              </div>
              <Badge tone={s.status === "active" ? "success" : "warn"}>{s.status}</Badge>
            </li>
          ))}
          {sites.length === 0 && <li className="py-6 text-sm text-[var(--color-muted)]">Площадок нет.</li>}
        </ul>
      </Card>

      <Card className="admin-table p-0">
        <div className="border-b px-5 py-3 font-semibold">Счета</div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">№</th>
              <th className="px-5 py-3 font-medium">Период</th>
              <th className="px-5 py-3 font-medium">Сумма</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Срок</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-mono text-xs">{inv.number}</td>
                <td className="px-5 py-3">{formatPeriod(inv.period)}</td>
                <td className="px-5 py-3 font-semibold">{formatKopAsRub(inv.totalKop)}</td>
                <td className="px-5 py-3">
                  <Badge tone={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "warn"}>
                    {inv.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">{formatDateTime(inv.dueAt)}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Счетов ещё не было.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
