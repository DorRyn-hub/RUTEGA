import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { getTicket } from "@/lib/tickets/engine";
import { formatDateTime, formatRelative } from "@/lib/format";
import { hasPermission } from "@/lib/auth/permissions";
import { TicketReplyForm } from "./TicketReplyForm";

export const metadata: Metadata = {
  title: "Тикет",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warn" | "danger" | "info" | "neutral" }> = {
  open: { label: "Открыт", tone: "warn" },
  in_progress: { label: "В работе", tone: "info" },
  waiting_customer: { label: "Ждёт клиента", tone: "warn" },
  resolved: { label: "Решён", tone: "success" },
  closed: { label: "Закрыт", tone: "neutral" },
};

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getActiveOrgContext();
  if (!ctx) redirect("/lk");
  const ticket = await getTicket(id);
  if (!ticket || ticket.organizationId !== ctx.org.id) notFound();
  const canReply = hasPermission(ctx.role, "tickets.write");
  const status = STATUS_LABEL[ticket.status] ?? { label: ticket.status, tone: "neutral" as const };

  return (
    <div className="space-y-5">
      <Link href="/lk/tickets" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Все тикеты
      </Link>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-[var(--color-muted)]">#{ticket.number}</span>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Открыт {ticket.openedByName} · {formatDateTime(ticket.createdAt)} · приоритет {ticket.priority}
          {ticket.assignedToName ? ` · отвечает ${ticket.assignedToName}` : ""}
        </p>
        <div className="mt-3 grid gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-2">
          <p>SLA на ответ: до {formatDateTime(ticket.slaRespondAt)}</p>
          <p>SLA на решение: до {formatDateTime(ticket.slaResolveAt)}</p>
        </div>
      </Card>

      <ol className="space-y-3">
        {ticket.messages.map((m) => (
          <li key={m.id}>
            <Card
              className={
                m.authorRole === "user"
                  ? "border-[var(--color-line)]"
                  : "border-[var(--color-brand-200)] bg-[var(--color-brand-50)]"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.authorName}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatRelative(m.createdAt)} · {formatDateTime(m.createdAt)}
                  </p>
                </div>
                {m.isInternal && <Badge tone="warn">внутренняя заметка</Badge>}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{m.body}</p>
            </Card>
          </li>
        ))}
      </ol>

      {canReply && ticket.status !== "closed" && <TicketReplyForm ticketId={ticket.id} />}
    </div>
  );
}
