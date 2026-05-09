import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { listOrgTickets } from "@/lib/tickets/engine";
import { formatRelative } from "@/lib/format";
import { hasPermission } from "@/lib/auth/permissions";
import { NewTicketForm } from "./NewTicketForm";

export const metadata: Metadata = {
  title: "Тикеты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" | "info" | "neutral" }> = {
  open: { label: "Открыт", tone: "warn" },
  in_progress: { label: "В работе", tone: "info" },
  waiting_customer: { label: "Ждёт ответа клиента", tone: "warn" },
  resolved: { label: "Решён", tone: "success" },
  closed: { label: "Закрыт", tone: "neutral" },
};

const PRIORITY_LABEL: Record<string, { label: string; tone: "warn" | "danger" | "info" | "neutral" }> = {
  low: { label: "Низкий", tone: "neutral" },
  normal: { label: "Обычный", tone: "info" },
  high: { label: "Высокий", tone: "warn" },
  urgent: { label: "Срочный", tone: "danger" },
};

export default async function TicketsPage() {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold">Тикеты</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Тикет-система доступна после привязки к организации.
        </p>
      </Card>
    );
  }
  const tickets = await listOrgTickets(ctx.org.id);
  const canWrite = hasPermission(ctx.role, "tickets.write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Тикеты</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Все обращения вашей организации с приоритетами и SLA. История сохраняется по компании, а не по конкретному сотруднику.
        </p>
      </header>

      {canWrite && <NewTicketForm />}

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">№</th>
              <th className="px-5 py-3 font-medium">Тема</th>
              <th className="px-5 py-3 font-medium">Приоритет</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">SLA</th>
              <th className="px-5 py-3 font-medium">Обновлён</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const status = STATUS_LABEL[t.status] ?? { label: t.status, tone: "neutral" as const };
              const priority = PRIORITY_LABEL[t.priority] ?? { label: t.priority, tone: "neutral" as const };
              const slaBreach = !t.firstResponseAt && new Date(t.slaRespondAt).getTime() < Date.now();
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-[var(--color-bg)]">
                  <td className="px-5 py-3 font-mono text-xs">#{t.number}</td>
                  <td className="px-5 py-3">
                    <Link href={`/lk/tickets/${t.id}`} className="font-medium hover:underline">
                      {t.subject}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">
                      Открыл {t.openedByName}
                      {t.assignedToName ? ` · отвечает ${t.assignedToName}` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={priority.tone}>{priority.label}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {t.firstResponseAt ? (
                      <span className="text-[var(--color-success)]">Ответ получен</span>
                    ) : slaBreach ? (
                      <span className="text-[var(--color-danger)]">SLA нарушен</span>
                    ) : (
                      <span className="text-[var(--color-muted)]">
                        Ответ к {formatRelative(t.slaRespondAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--color-muted)]">
                    {formatRelative(t.updatedAt)}
                  </td>
                </tr>
              );
            })}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Тикетов пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
