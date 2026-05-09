import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserBills } from "@/lib/repos";
import { getActiveOrgContext } from "@/lib/org/context";
import {
  getAccountSummary,
  listOrgInvoices,
  listOrgCharges,
  listOrgPayments,
} from "@/lib/billing/engine";
import { formatDateTime, formatPeriod, formatKopAsRub, formatRub } from "@/lib/format";
import { hasPermission } from "@/lib/auth/permissions";
import { PayInvoiceButton } from "./PayInvoiceButton";

export const metadata: Metadata = {
  title: "Счета и платежи",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" | "info" }> = {
  paid: { label: "Оплачено", tone: "success" },
  issued: { label: "К оплате", tone: "warn" },
  overdue: { label: "Просрочено", tone: "danger" },
  cancelled: { label: "Отменён", tone: "neutral" as never },
  due: { label: "К оплате", tone: "warn" },
};

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");

  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return <LegacyB2CView userId={user.id} />;
  }

  const [account, invoices, charges, payments] = await Promise.all([
    getAccountSummary(ctx.org.id),
    listOrgInvoices(ctx.org.id),
    listOrgCharges(ctx.org.id),
    listOrgPayments(ctx.org.id),
  ]);

  const canPay = hasPermission(ctx.role, "billing.pay");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Финансы</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Лицевой счёт, счета на оплату, история проводок и платежей.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Лицевой счёт</p>
          <p className="mt-1 text-xl font-bold">{account?.number ?? "—"}</p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Режим: {account?.billingMode === "prepay" ? "предоплата" : "постоплата"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Текущий баланс</p>
          <p
            className={
              "mt-1 text-2xl font-bold " +
              ((account?.balanceKop ?? 0) < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]")
            }
          >
            {account ? formatKopAsRub(account.balanceKop) : "—"}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Кредитный лимит: {account ? formatKopAsRub(account.creditLimitKop) : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Месячный расход</p>
          <p className="mt-1 text-2xl font-bold">
            {account ? formatKopAsRub(account.monthlyChargeKop) : "—"}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Сумма по активным услугам всех площадок
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Счета на оплату</h2>
          <span className="text-sm text-[var(--color-muted)]">{invoices.length} шт.</span>
        </div>
        <div className="-mx-6 mt-4 overflow-x-auto px-6">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-[var(--color-muted)]">
                <th className="py-3 font-medium">№</th>
                <th className="py-3 font-medium">Период</th>
                <th className="py-3 font-medium">Сумма</th>
                <th className="py-3 font-medium">В т.ч. НДС</th>
                <th className="py-3 font-medium">Статус</th>
                <th className="py-3 font-medium">Срок оплаты</th>
                <th className="py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const meta = STATUS_LABEL[inv.status] ?? { label: inv.status, tone: "info" as const };
                return (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{inv.number}</td>
                    <td className="py-3">{formatPeriod(inv.period)}</td>
                    <td className="py-3 font-semibold">{formatKopAsRub(inv.totalKop)}</td>
                    <td className="py-3 text-[var(--color-muted)]">{formatKopAsRub(inv.vatKop)}</td>
                    <td className="py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="py-3 text-[var(--color-muted)]">{formatDateTime(inv.dueAt)}</td>
                    <td className="py-3 text-right">
                      <Link
                        target="_blank"
                        href={`/api/lk/billing/invoice/${inv.id}`}
                        className="mr-3 text-sm text-[var(--color-brand-700)] underline"
                      >
                        PDF
                      </Link>
                      {canPay && inv.status !== "paid" && (
                        <PayInvoiceButton invoiceId={inv.id} totalKop={inv.totalKop} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[var(--color-muted)]">
                    Счетов пока нет. Первый счёт будет выставлен после прогона биллинга.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Последние проводки</h2>
          <ul className="mt-4 divide-y text-sm">
            {charges.slice(0, 8).map((c) => (
              <li key={c.id} className="flex justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{c.description}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatPeriod(c.period)} · {formatDateTime(c.createdAt)}
                  </p>
                </div>
                <p
                  className={
                    "shrink-0 font-semibold " +
                    (c.amountKop < 0 ? "text-[var(--color-success)]" : "")
                  }
                >
                  {c.amountKop < 0 ? "−" : ""}
                  {formatKopAsRub(Math.abs(c.amountKop))}
                </p>
              </li>
            ))}
            {charges.length === 0 && (
              <li className="py-6 text-center text-[var(--color-muted)]">
                Проводок пока нет.
              </li>
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Платежи</h2>
          <ul className="mt-4 divide-y text-sm">
            {payments.slice(0, 8).map((p) => (
              <li key={p.id} className="flex justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{p.note ?? p.method}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {p.method} · {formatDateTime(p.createdAt)}
                    {p.externalRef ? ` · ${p.externalRef}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-[var(--color-success)]">
                  +{formatKopAsRub(p.amountKop)}
                </p>
              </li>
            ))}
            {payments.length === 0 && (
              <li className="py-6 text-center text-[var(--color-muted)]">
                Платежей пока нет.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Подключение ЭДО (Диадок/СБИС/Контур) запланировано — после интеграции акты и счёт-фактуры будут отправляться напрямую в учётную систему.
      </p>
    </div>
  );
}

async function LegacyB2CView({ userId }: { userId: string }) {
  const bills = await getUserBills(userId);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Счета и платежи</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          История начислений и оплат. Чеки приходят на e-mail сразу после платежа.
        </p>
      </header>

      <Card>
        {bills.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Счетов пока нет.</p>
        ) : (
          <div className="-mx-6 overflow-x-auto px-6">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-[var(--color-muted)]">
                  <th className="py-3 font-medium">Период</th>
                  <th className="py-3 font-medium">Сумма</th>
                  <th className="py-3 font-medium">Статус</th>
                  <th className="py-3 font-medium">Оплачено</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => {
                  const status = STATUS_LABEL[b.status] ?? { label: b.status, tone: "neutral" as const };
                  return (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{formatPeriod(b.period)}</td>
                      <td className="py-3 font-semibold">{formatRub(b.amount)}</td>
                      <td className="py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="py-3 text-[var(--color-muted)]">
                        {b.paidAt ? formatDateTime(b.paidAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card>
        <h2 className="text-base font-semibold">Подключите B2B-портал</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          После создания организации вам будут доступны: реальный лицевой счёт, генерация счетов на оплату с НДС, выгрузка проводок, SLA-компенсации и API.
        </p>
        <div className="mt-3">
          <LinkButton href="/lk/connection-requests">Оставить заявку на подключение</LinkButton>
        </div>
      </Card>
    </div>
  );
}
