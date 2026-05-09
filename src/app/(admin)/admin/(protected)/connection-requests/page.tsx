import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { listConnectionRequests } from "@/lib/connection/engine";
import { formatDateTime, formatKopAsRub } from "@/lib/format";

export const metadata: Metadata = {
  title: "Админ · Заявки на подключение",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { items, total } = await listConnectionRequests({ status, limit: 50 });
  return (
    <div className="space-y-6">
      <PageHeader title="Заявки на подключение" description={`Всего: ${total}.`} />
      <form className="admin-form flex flex-wrap items-stretch gap-2">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:max-w-xs"
        >
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="survey">Обследование</option>
          <option value="quoted">Выставлен КП</option>
          <option value="accepted">Принят</option>
          <option value="active">Подключено</option>
          <option value="rejected">Отказ</option>
        </select>
        <button className="h-11 rounded-[var(--radius-md)] border bg-white px-4 text-sm sm:h-10">
          Фильтр
        </button>
      </form>
      <Card className="admin-table p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Контакт</th>
              <th className="px-5 py-3 font-medium">Адрес</th>
              <th className="px-5 py-3 font-medium">Услуга</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">КП</th>
              <th className="px-5 py-3 font-medium">Создана</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/admin/connection-requests/${r.id}`} className="font-medium hover:underline">
                    {r.contactName}
                  </Link>
                  <p className="text-xs text-[var(--color-muted)]">{r.contactPhone}</p>
                </td>
                <td className="px-5 py-3 text-xs">{r.address}</td>
                <td className="px-5 py-3 text-xs">
                  {r.serviceType}
                  {r.speedMbps ? ` · ${r.speedMbps} Мбит/с` : ""}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={r.status === "active" || r.status === "accepted" ? "success" : r.status === "rejected" ? "danger" : "info"}>
                    {r.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-xs">
                  {r.quote ? (
                    <span>
                      {formatKopAsRub(r.quote.oneOffKop)} + {formatKopAsRub(r.quote.monthlyKop)}/мес
                    </span>
                  ) : (
                    <span className="text-[var(--color-muted)]">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(r.createdAt)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Заявок нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
