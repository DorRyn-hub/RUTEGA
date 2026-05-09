import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { listIncidents } from "@/lib/sla/engine";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Админ · Инциденты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminIncidentsPage() {
  const [open, recent] = await Promise.all([
    listIncidents({ open: true, limit: 30 }),
    listIncidents({ open: false, limit: 30 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Инциденты"
        description="Открытые и закрытые инциденты сети. При закрытии автоматически считаются компенсации SLA."
        actionLabel="Создать инцидент"
        actionHref="/admin/incidents/new"
      />

      <Card className="p-0">
        <div className="border-b px-5 py-3 font-semibold">Активные ({open.length})</div>
        <ul className="divide-y">
          {open.map((inc) => (
            <li key={inc.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <Link href={`/admin/incidents/${inc.id}`} className="font-medium hover:underline">
                  {inc.title}
                </Link>
                <p className="text-xs text-[var(--color-muted)]">
                  Начало: {formatDateTime(inc.startedAt)} · {inc.serviceTitle ?? "—"}
                </p>
              </div>
              <Badge tone={inc.severity === "critical" || inc.severity === "major" ? "danger" : inc.severity === "maintenance" ? "info" : "warn"}>
                {inc.severity}
              </Badge>
            </li>
          ))}
          {open.length === 0 && (
            <li className="px-5 py-6 text-center text-[var(--color-muted)]">Активных инцидентов нет.</li>
          )}
        </ul>
      </Card>

      <Card className="p-0">
        <div className="border-b px-5 py-3 font-semibold">История ({recent.length})</div>
        <ul className="divide-y">
          {recent.map((inc) => (
            <li key={inc.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <Link href={`/admin/incidents/${inc.id}`} className="font-medium hover:underline">
                  {inc.title}
                </Link>
                <p className="text-xs text-[var(--color-muted)]">
                  {formatDateTime(inc.startedAt)} —{" "}
                  {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : "—"}
                </p>
              </div>
              <Badge tone="success">{inc.severity}</Badge>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="px-5 py-6 text-center text-[var(--color-muted)]">Истории пока нет.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
