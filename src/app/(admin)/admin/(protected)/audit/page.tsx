import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { queryAuditLog } from "@/lib/audit/log";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Админ · Аудит-лог",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; org?: string; page?: string }>;
}) {
  const { q, org, page } = await searchParams;
  const { items, total, limit } = await queryAuditLog({
    action: q,
    organizationId: org,
    page: Number(page ?? "1"),
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аудит-лог"
        description={`Все действия операторов и клиентов. Хранится бессрочно (требование 152-ФЗ / КИИ). Всего: ${total}.`}
      />
      <form className="admin-form flex flex-wrap items-stretch gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Действие (например, billing.payment.create)"
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:w-72 sm:flex-none"
        />
        <input
          name="org"
          defaultValue={org}
          placeholder="ID организации"
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:w-72 sm:flex-none"
        />
        <button className="h-11 rounded-[var(--radius-md)] border bg-white px-4 text-sm sm:h-10">
          Найти
        </button>
      </form>
      <Card className="admin-table p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Время</th>
              <th className="px-5 py-3 font-medium">Действие</th>
              <th className="px-5 py-3 font-medium">Сотрудник</th>
              <th className="px-5 py-3 font-medium">Цель</th>
              <th className="px-5 py-3 font-medium">IP</th>
              <th className="px-5 py-3 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0 align-top">
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(it.createdAt)}
                </td>
                <td className="px-5 py-3 text-xs">
                  <Badge tone="info">{it.action}</Badge>
                </td>
                <td className="px-5 py-3 text-xs">{it.actorName ?? "—"}</td>
                <td className="px-5 py-3 text-xs">
                  {it.targetType ? `${it.targetType}` : "—"}
                  {it.targetId ? ` · ${it.targetId.slice(0, 10)}…` : ""}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{it.ip ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {it.payload ? (
                    <code className="break-all">{JSON.stringify(it.payload).slice(0, 120)}</code>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Записей нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t px-5 py-3 text-xs text-[var(--color-muted)]">
          Показано {items.length} из {total} (limit={limit})
        </div>
      </Card>
    </div>
  );
}
