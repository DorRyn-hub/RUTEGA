import Link from "next/link";
import { Users, Wrench, Tag, Newspaper, Inbox, Receipt, AlertTriangle, ShieldOff } from "lucide-react";
import { adminMetrics, adminRecentActivity } from "@/lib/admin/repos";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { Card } from "@/components/ui/Card";
import { formatRub } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [m, activity] = await Promise.all([adminMetrics(), adminRecentActivity(12)]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Панель управления"
        description="Сводка по сайту: пользователи, выручка, заявки и активность."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Пользователи"
          value={m.users}
          delta={m.deltas.users}
          spark={m.series.users}
          hint={`Активных услуг: ${m.activeServices}`}
        />
        <StatCard
          label="Заявки"
          value={m.leads}
          delta={m.deltas.leads}
          spark={m.series.leads}
          hint={m.leadsNew > 0 ? `Новых: ${m.leadsNew}` : "Все обработаны"}
          tone={m.leadsNew > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Выручка (paid)"
          value={formatRub(m.revenuePaidTotal)}
          delta={m.deltas.revenue}
          spark={m.series.revenue}
          hint="За 30 дней"
        />
        <StatCard
          label="Неоплачено счетов"
          value={m.outstanding}
          tone={m.outstanding > 0 ? "warn" : "success"}
          hint={m.outstanding > 0 ? "due + overdue" : "Все оплачено"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users" className="block">
          <Card className="flex items-center gap-3 transition-colors hover:bg-[var(--color-bg)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Пользователи</p>
              <p className="text-lg font-semibold">{m.users}</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/services" className="block">
          <Card className="flex items-center gap-3 transition-colors hover:bg-[var(--color-bg)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-amber-50 text-amber-700">
              <Wrench className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Услуги / Тарифы</p>
              <p className="text-lg font-semibold">
                {m.services} / {m.tariffs}
              </p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/news" className="block">
          <Card className="flex items-center gap-3 transition-colors hover:bg-[var(--color-bg)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-emerald-50 text-emerald-700">
              <Newspaper className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Новости</p>
              <p className="text-lg font-semibold">{m.news}</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/bills" className="block">
          <Card className="flex items-center gap-3 transition-colors hover:bg-[var(--color-bg)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-rose-50 text-rose-700">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Счета</p>
              <p className="text-lg font-semibold">{m.bills}</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Лента событий</h2>
              <span className="text-xs text-[var(--color-muted)]">последние {activity.length}</span>
            </div>
            <ActivityFeed items={activity} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-display text-lg font-bold">Топ-5 тарифов</h2>
            {m.topTariffs.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Пока нет подключений.</p>
            ) : (
              <ul className="space-y-2">
                {m.topTariffs.map((t) => (
                  <li
                    key={t.slug}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-[var(--color-muted)]">{t.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-brand-700)]">
                        {t.count}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">{formatRub(t.priceRub)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-lg font-bold">Сигналы</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                    m.outstanding > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <span>Неоплаченных счетов: {m.outstanding}</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                    m.leadsNew > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Inbox className="h-3.5 w-3.5" />
                </span>
                <span>Новых заявок: {m.leadsNew}</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                    m.bannedUsers > 0
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                </span>
                <span>Заблокированных юзеров: {m.bannedUsers}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                  <Tag className="h-3.5 w-3.5" />
                </span>
                <span>Активных услуг: {m.activeServices}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
