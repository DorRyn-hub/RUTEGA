import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import { IncidentControls } from "./IncidentControls";

export const metadata: Metadata = {
  title: "Админ · Инцидент",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function IncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const incident = await prisma.serviceIncident.findUnique({
    where: { id },
    include: {
      service: { select: { title: true } },
      updates: { orderBy: { createdAt: "asc" } },
      compensations: {
        include: { organization: { select: { legalName: true, shortName: true } } },
      },
    },
  });
  if (!incident) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/incidents" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Все инциденты
      </Link>
      <PageHeader
        title={incident.title}
        description={`${incident.service?.title ?? "—"} · severity ${incident.severity}`}
      />
      <Card>
        <p className="text-sm">{incident.summary}</p>
        <div className="mt-3 grid gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-2">
          <p>Начало: {formatDateTime(incident.startedAt)}</p>
          <p>{incident.resolvedAt ? `Решён: ${formatDateTime(incident.resolvedAt)}` : "Открыт"}</p>
        </div>
        {incident.publicRfo && (
          <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3 text-sm">
            <strong>RFO: </strong>
            <p className="mt-1 whitespace-pre-line">{incident.publicRfo}</p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Лента обновлений</h2>
        <ol className="mt-3 space-y-3">
          {incident.updates.map((u) => (
            <li key={u.id} className="border-l-2 border-[var(--color-line)] pl-3">
              <p className="text-xs text-[var(--color-muted)]">
                {formatDateTime(u.createdAt)} · {u.status}
              </p>
              <p className="mt-1 text-sm">{u.message}</p>
            </li>
          ))}
          {incident.updates.length === 0 && (
            <li className="text-sm text-[var(--color-muted)]">Обновлений нет.</li>
          )}
        </ol>
      </Card>

      <IncidentControls incidentId={incident.id} resolved={Boolean(incident.resolvedAt)} />

      <Card className="admin-table p-0">
        <div className="border-b px-5 py-3 font-semibold">
          Компенсации SLA ({incident.compensations.length})
        </div>
        <ul className="divide-y">
          {incident.compensations.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{c.organization.shortName ?? c.organization.legalName}</p>
                <p className="text-xs text-[var(--color-muted)]">{c.reason}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{(c.amountKop / 100).toFixed(2)} ₽</p>
                <Badge tone={c.applied ? "success" : "warn"}>
                  {c.applied ? "применена" : "ожидает"}
                </Badge>
              </div>
            </li>
          ))}
          {incident.compensations.length === 0 && (
            <li className="px-5 py-6 text-center text-[var(--color-muted)]">
              Компенсации появятся после закрытия инцидента.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
