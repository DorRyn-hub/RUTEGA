"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  ticketId: string;
  currentStatus: string;
}

export function AdminTicketControls({ ticketId, currentStatus }: Props) {
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  async function send() {
    if (!body.trim()) return;
    setPending(true);
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, isInternal }),
    });
    setBody("");
    setPending(false);
    router.refresh();
  }

  async function changeStatus(next: string) {
    setStatus(next);
    setPending(true);
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Card>
      <h3 className="font-semibold">Ответ / действия</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="mt-2 w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
        placeholder="Ответ клиенту или внутренняя заметка…"
      />
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isInternal}
          onChange={(e) => setIsInternal(e.target.checked)}
        />
        Внутренняя заметка (клиент не видит)
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={send} disabled={pending || !body.trim()}>
          {pending ? "Отправка…" : isInternal ? "Сохранить заметку" : "Ответить клиенту"}
        </Button>
        <select
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
          disabled={pending}
          className="h-10 rounded-[var(--radius-md)] border px-3 text-sm"
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="waiting_customer">Waiting customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </Card>
  );
}
