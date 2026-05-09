import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, Ticket, Cable, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserBills, getUserServices } from "@/lib/repos";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatPeriod, formatRub, formatRubPerMonth, formatKopAsRub } from "@/lib/format";
import { FadeInUp } from "@/components/motion/FadeInUp";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { getActiveOrgContext } from "@/lib/org/context";
import { getAccountSummary, listOrgInvoices } from "@/lib/billing/engine";
import { listOrgTickets } from "@/lib/tickets/engine";
import { listIncidents, getOverallStatus } from "@/lib/sla/engine";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" }> = {
  paid: { label: "Оплачено", tone: "success" },
  due: { label: "К оплате", tone: "warn" },
  overdue: { label: "Просрочено", tone: "danger" },
};

export const dynamic = "force-dynamic";

export default async function AccountHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");

  const ctx = await getActiveOrgContext();
  if (ctx) {
    return <B2BHome userName={user.fullName} orgId={ctx.org.id} orgName={ctx.org.shortName ?? ctx.org.legalName} />;
  }

  const [bills, services] = await Promise.all([
    getUserBills(user.id),
    getUserServices(user.id),
  ]);
  const dueBill = bills.find((b) => b.status === "due" || b.status === "overdue");
  const monthly = services.reduce((sum, s) => sum + s.priceRub, 0);

  return (
    <div className="space-y-6">
      <FadeInUp>
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Здравствуйте, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Здесь — обзор ваших услуг, ближайших платежей и быстрые действия.
          </p>
        </header>
      </FadeInUp>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2">
        <StaggerItem>
        <Card className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-muted)]">Месячный платёж</p>
          <p className="text-3xl font-bold">{formatRubPerMonth(monthly)}</p>
          <p className="text-sm text-[var(--color-muted)]">
            {services.length === 0
              ? "Услуг ещё не подключено"
              : `${services.length} активных услуг`}
          </p>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-muted)]">Ближайший счёт</p>
          {dueBill ? (
            <>
              <p className="text-3xl font-bold">{formatRub(dueBill.amount)}</p>
              <p className="text-sm">
                <Badge tone={STATUS_LABEL[dueBill.status]?.tone ?? "neutral"}>
                  {STATUS_LABEL[dueBill.status]?.label ?? dueBill.status}
                </Badge>{" "}
                <span className="text-[var(--color-muted)]">{formatPeriod(dueBill.period)}</span>
              </p>
              <LinkButton href="/lk/billing" size="sm" className="mt-2 w-fit">
                <CreditCard aria-hidden="true" className="h-4 w-4" />
                К счетам
              </LinkButton>
            </>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Все счета оплачены 👌</p>
          )}
        </Card>
        </StaggerItem>
      </StaggerContainer>

      <FadeInUp delay={0.1}>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Активные услуги</h2>
          <Link
            href="/lk/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-700)] hover:underline"
          >
            Все услуги <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        {services.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            У вас пока нет подключённых услуг. Перейдите в каталог, чтобы добавить.
          </p>
        ) : (
          <ul className="divide-y">
            {services.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{s.serviceTitle}</p>
                  <p className="text-sm text-[var(--color-muted)]">Тариф «{s.tariffTitle}»</p>
                </div>
                <p className="font-semibold">{formatRubPerMonth(s.priceRub)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      </FadeInUp>
    </div>
  );
}

interface B2BProps {
  userName: string;
  orgId: string;
  orgName: string;
}

async function B2BHome({ userName, orgId, orgName }: B2BProps) {
  const [account, invoices, tickets, openIncidents, overall] = await Promise.all([
    getAccountSummary(orgId),
    listOrgInvoices(orgId),
    listOrgTickets(orgId),
    listIncidents({ open: true, limit: 5 }),
    getOverallStatus(),
  ]);

  const nextInvoice = invoices.find((i) => i.status === "issued" || i.status === "overdue");
  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_customer",
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Здравствуйте, {userName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Активная организация: <strong>{orgName}</strong>. Сводка по балансу, тикетам и инцидентам.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
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
          <Link href="/lk/billing" className="mt-2 inline-block text-xs text-[var(--color-brand-700)] hover:underline">
            Финансы →
          </Link>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Ближайший счёт</p>
          {nextInvoice ? (
            <>
              <p className="mt-1 text-2xl font-bold">{formatKopAsRub(nextInvoice.totalKop)}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {formatPeriod(nextInvoice.period)} · до {nextInvoice.dueAt.slice(0, 10)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-muted)]">Все счета оплачены</p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Открытых тикетов</p>
          <p className="mt-1 text-2xl font-bold">{openTickets.length}</p>
          <Link href="/lk/tickets" className="mt-2 inline-block text-xs text-[var(--color-brand-700)] hover:underline">
            Перейти →
          </Link>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Состояние сети</p>
          <p className="mt-1 text-base font-semibold">{overall.label}</p>
          <Link href="/status" className="mt-2 inline-block text-xs text-[var(--color-brand-700)] hover:underline">
            Status page →
          </Link>
        </Card>
      </div>

      {openIncidents.length > 0 && (
        <Card className="border-l-4 border-[var(--color-warn)] bg-amber-50">
          <h2 className="font-semibold">Активные инциденты сети</h2>
          <ul className="mt-2 divide-y">
            {openIncidents.map((inc) => (
              <li key={inc.id} className="py-2 text-sm">
                <span className="font-medium">{inc.title}</span>
                <p className="text-xs text-[var(--color-muted)]">{inc.summary}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Активные тикеты</h2>
          <LinkButton href="/lk/tickets" size="sm" variant="ghost">
            <Ticket className="h-4 w-4" />
            К списку
          </LinkButton>
        </div>
        {openTickets.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Открытых тикетов нет.</p>
        ) : (
          <ul className="divide-y">
            {openTickets.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/lk/tickets/${t.id}`} className="font-medium hover:underline">
                    #{t.number} {t.subject}
                  </Link>
                  <p className="text-xs text-[var(--color-muted)]">{t.openedByName}</p>
                </div>
                <Badge tone={t.priority === "urgent" || t.priority === "high" ? "danger" : "info"}>
                  {t.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <LinkButton href="/lk/connection-requests" variant="secondary" size="sm">
          <Cable className="h-4 w-4" />
          Заявка на подключение
        </LinkButton>
        <LinkButton href="/lk/security" variant="secondary" size="sm">
          <ShieldCheck className="h-4 w-4" />
          Безопасность
        </LinkButton>
        <LinkButton href="/lk/api-keys" variant="secondary" size="sm">
          API-ключи
        </LinkButton>
      </div>
    </div>
  );
}
