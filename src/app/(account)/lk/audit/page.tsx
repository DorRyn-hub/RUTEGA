import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { queryAuditLog } from "@/lib/audit/log";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Журнал действий",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Журнал действий</h1>
        <p className="mt-2 text-[var(--color-muted)]">Раздел доступен после привязки к организации.</p>
      </Card>
    );
  }
  if (!hasPermission(ctx.role, "audit.read")) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Журнал действий</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Этот раздел доступен только директору и бухгалтеру.
        </p>
      </Card>
    );
  }
  const { items, total } = await queryAuditLog({
    organizationId: ctx.org.id,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Журнал действий</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Полный аудит-лог работы вашей организации с порталом. Хранится бессрочно, удовлетворяет требованиям 152-ФЗ и подходит для отчётов в ИБ.
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Всего записей: {total}</p>
      </header>
      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Время</th>
              <th className="px-5 py-3 font-medium">Действие</th>
              <th className="px-5 py-3 font-medium">Сотрудник</th>
              <th className="px-5 py-3 font-medium">Объект</th>
              <th className="px-5 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(it.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <Badge tone="info">{it.action}</Badge>
                </td>
                <td className="px-5 py-3">{it.actorName ?? "—"}</td>
                <td className="px-5 py-3 text-xs">
                  {it.targetType}
                  {it.targetId ? ` · ${it.targetId.slice(0, 8)}…` : ""}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{it.ip ?? "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Журнал пока пуст.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
