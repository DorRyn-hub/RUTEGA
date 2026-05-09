import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { listAllTickets } from "@/lib/tickets/engine";
import { formatDateTime, formatRelative } from "@/lib/format";

export const metadata: Metadata = {
  title: "Админ · Тикеты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; page?: string }>;
}) {
  const { status, priority, page } = await searchParams;
  const { items, total } = await listAllTickets({
    status,
    priority,
    page: Number(page ?? "1"),
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Тикеты" description={`Всего открытых обращений: ${total}.`} />

      <form className="admin-form flex flex-wrap items-stretch gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:max-w-xs sm:flex-none"
        >
          <option value="">Все статусы</option>
          <option value="open">Открытые</option>
          <option value="in_progress">В работе</option>
          <option value="waiting_customer">Ожидание клиента</option>
          <option value="resolved">Решённые</option>
          <option value="closed">Закрытые</option>
        </select>
        <select
          name="priority"
          defaultValue={priority ?? ""}
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:max-w-xs sm:flex-none"
        >
          <option value="">Любой приоритет</option>
          <option value="low">Низкий</option>
          <option value="normal">Обычный</option>
          <option value="high">Высокий</option>
          <option value="urgent">Срочный</option>
        </select>
        <button className="h-11 rounded-[var(--radius-md)] border bg-white px-4 text-sm sm:h-10">
          Применить
        </button>
      </form>

      <Card className="admin-table p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">№</th>
              <th className="px-5 py-3 font-medium">Тема</th>
              <th className="px-5 py-3 font-medium">Организация</th>
              <th className="px-5 py-3 font-medium">Приоритет</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">SLA на ответ</th>
              <th className="px-5 py-3 font-medium">Обновлён</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => {
              const slaBreach = !t.firstResponseAt && new Date(t.slaRespondAt).getTime() < Date.now();
              return (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">#{t.number}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/tickets/${t.id}`} className="font-medium hover:underline">
                      {t.subject}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">{t.openedByName}</p>
                  </td>
                  <td className="px-5 py-3 text-xs">{t.organizationName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={t.priority === "urgent" || t.priority === "high" ? "danger" : "info"}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      tone={
                        t.status === "resolved" || t.status === "closed"
                          ? "success"
                          : t.status === "open"
                            ? "warn"
                            : "info"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {t.firstResponseAt ? (
                      <span className="text-[var(--color-success)]">отвечено</span>
                    ) : slaBreach ? (
                      <span className="text-[var(--color-danger)]">просрочен</span>
                    ) : (
                      <span className="text-[var(--color-muted)]">{formatRelative(t.slaRespondAt)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                    {formatDateTime(t.updatedAt)}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Тикетов нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
