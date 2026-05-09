import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTicket } from "@/lib/tickets/engine";
import { formatDateTime, formatRelative } from "@/lib/format";
import { AdminTicketControls } from "./AdminTicketControls";

export const metadata: Metadata = {
  title: "Админ · Тикет",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) notFound();
  return (
    <div className="space-y-5">
      <Link href="/admin/tickets" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Все тикеты
      </Link>
      <PageHeader
        title={`#${ticket.number} ${ticket.subject}`}
        description={`Открыл ${ticket.openedByName} · ${formatDateTime(ticket.createdAt)}`}
      />
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <Card className="p-3">
          <p className="text-[var(--color-muted)]">SLA на ответ</p>
          <p className="font-semibold">{formatRelative(ticket.slaRespondAt)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[var(--color-muted)]">SLA на решение</p>
          <p className="font-semibold">{formatRelative(ticket.slaResolveAt)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[var(--color-muted)]">Статус</p>
          <Badge tone="info">{ticket.status}</Badge>
        </Card>
      </div>

      <ol className="space-y-3">
        {ticket.messages.map((m) => (
          <li key={m.id}>
            <Card className={m.isInternal ? "border-amber-300 bg-amber-50" : undefined}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{m.authorName}</p>
                <p className="text-xs text-[var(--color-muted)]">{formatDateTime(m.createdAt)}</p>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{m.body}</p>
              {m.isInternal && (
                <Badge tone="warn" className="mt-2">
                  Внутренняя заметка
                </Badge>
              )}
            </Card>
          </li>
        ))}
      </ol>

      <AdminTicketControls ticketId={ticket.id} currentStatus={ticket.status} />
    </div>
  );
}
