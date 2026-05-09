"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function send() {
    if (!body.trim()) return;
    setPending(true);
    setErr(null);
    const res = await fetch(`/api/lk/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Не удалось отправить");
      return;
    }
    setBody("");
    router.refresh();
  }

  async function close() {
    setPending(true);
    await fetch(`/api/lk/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Card>
      <h3 className="font-semibold">Ответить</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="mt-2 w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
        placeholder="Ваше сообщение…"
      />
      {err && <p className="mt-2 text-sm text-[var(--color-danger)]">{err}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={send} disabled={pending || !body.trim()}>
          {pending ? "Отправка…" : "Отправить"}
        </Button>
        <Button variant="ghost" onClick={close} disabled={pending}>
          Закрыть тикет
        </Button>
      </div>
    </Card>
  );
}
