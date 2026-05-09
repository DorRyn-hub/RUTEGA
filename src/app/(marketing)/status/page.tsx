import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { listIncidents, listStatusComponents, getOverallStatus } from "@/lib/sla/engine";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Состояние сервисов Rutega",
  description:
    "Публичная страница состояния сети Rutega: текущий статус компонентов, активные инциденты, история и RFO.",
  alternates: { canonical: "/status" },
};

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" | "info" }> = {
  operational: { label: "Работает", tone: "success" },
  maintenance: { label: "Техработы", tone: "info" },
  degraded: { label: "Деградация", tone: "warn" },
  partial_outage: { label: "Частичный сбой", tone: "warn" },
  major_outage: { label: "Крупный сбой", tone: "danger" },
};

const SEVERITY_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" | "info" }> = {
  minor: { label: "Низкая", tone: "warn" },
  major: { label: "Высокая", tone: "danger" },
  critical: { label: "Критичная", tone: "danger" },
  maintenance: { label: "Плановые работы", tone: "info" },
};

export default async function StatusPage() {
  const [components, openIncidents, recentIncidents, overall] = await Promise.all([
    listStatusComponents(),
    listIncidents({ open: true, limit: 20 }),
    listIncidents({ open: false, limit: 20 }),
    getOverallStatus(),
  ]);

  const groupKeys = Array.from(
    new Set(components.map((c) => c.group ?? "Прочее")),
  );
  const overallTone = STATUS_LABEL[overall.level]?.tone ?? "info";

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ href: "/status", label: "Статус сервисов" }]} />
      </Container>

      <Section>
        <Container className="space-y-8">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Статус сервисов</h1>
              <p className="mt-2 text-[var(--color-muted)]">
                Текущее состояние сети, активные инциденты и история. Обновляется в реальном времени.
              </p>
            </div>
            <Badge tone={overallTone}>{overall.label}</Badge>
          </header>

          {openIncidents.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border-l-4 border-[var(--color-warn)] bg-amber-50 p-5">
              <h2 className="font-semibold">Активные инциденты</h2>
              <ul className="mt-3 space-y-3">
                {openIncidents.map((inc) => (
                  <li key={inc.id} className="rounded-[var(--radius-md)] bg-white/70 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold">{inc.title}</span>
                      <Badge tone={SEVERITY_LABEL[inc.severity]?.tone ?? "warn"}>
                        {SEVERITY_LABEL[inc.severity]?.label ?? inc.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{inc.summary}</p>
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      Начало: {formatDateTime(inc.startedAt)}
                      {inc.serviceTitle ? ` · Сервис: ${inc.serviceTitle}` : ""}
                    </p>
                    {inc.updates.length > 0 && (
                      <ol className="mt-3 space-y-2 border-l-2 border-[var(--color-line)] pl-4">
                        {inc.updates.map((u) => (
                          <li key={u.id} className="text-sm">
                            <span className="font-medium">{u.status}</span>
                            <span className="text-[var(--color-muted)]"> · {formatDateTime(u.createdAt)}</span>
                            <p className="mt-0.5">{u.message}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3">
            <h2 className="text-xl font-semibold">Компоненты сети</h2>
            {groupKeys.map((group) => (
              <Card key={group} className="p-0">
                <div className="border-b px-5 py-3 text-sm font-semibold text-[var(--color-muted)]">
                  {group}
                </div>
                <ul className="divide-y">
                  {components
                    .filter((c) => (c.group ?? "Прочее") === group)
                    .map((c) => {
                      const meta = STATUS_LABEL[c.currentStatus];
                      return (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div>
                            <p className="font-medium">{c.name}</p>
                            {c.description && (
                              <p className="text-xs text-[var(--color-muted)]">
                                {c.description}
                              </p>
                            )}
                          </div>
                          <Badge tone={meta?.tone ?? "info"}>
                            {meta?.label ?? c.currentStatus}
                          </Badge>
                        </li>
                      );
                    })}
                </ul>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold">История инцидентов</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Последние закрытые инциденты с публичным RFO (Reason For Outage).
            </p>
            <div className="mt-4 space-y-3">
              {recentIncidents.length === 0 && (
                <Card>За последние 30 дней инцидентов не было. Так держать.</Card>
              )}
              {recentIncidents.map((inc) => (
                <Card key={inc.id}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold">{inc.title}</span>
                    <Badge tone={SEVERITY_LABEL[inc.severity]?.tone ?? "info"}>
                      {SEVERITY_LABEL[inc.severity]?.label ?? inc.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{inc.summary}</p>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {formatDateTime(inc.startedAt)} —{" "}
                    {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : "не решён"}
                  </p>
                  {inc.publicRfo && (
                    <details className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3 text-sm">
                      <summary className="cursor-pointer font-medium">RFO</summary>
                      <p className="mt-2 whitespace-pre-line">{inc.publicRfo}</p>
                    </details>
                  )}
                </Card>
              ))}
            </div>
            <p className="mt-6 text-xs text-[var(--color-muted)]">
              JSON-feed для мониторинга: <a className="underline" href="/api/v1/status">/api/v1/status</a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
