"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function NewTicketForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/lk/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: String(formData.get("subject") ?? ""),
        body: String(formData.get("body") ?? ""),
        priority: String(formData.get("priority") ?? "normal"),
        category: String(formData.get("category") ?? "general"),
      }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось создать тикет");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Открыть новый тикет</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Опишите проблему — SLA на первичный ответ начнёт отсчёт с момента создания.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>Создать тикет</Button>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <h2 className="font-semibold">Новый тикет</h2>
      <form
        action={handleSubmit}
        className="mt-4 space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Категория
            <select
              name="category"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
              defaultValue="general"
            >
              <option value="general">Общая</option>
              <option value="technical">Техническая</option>
              <option value="billing">Биллинг</option>
              <option value="sales">Продажи</option>
              <option value="sla">SLA / инцидент</option>
            </select>
          </label>
          <label className="text-sm">
            Приоритет
            <select
              name="priority"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
              defaultValue="normal"
            >
              <option value="low">Низкий</option>
              <option value="normal">Обычный</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочный</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Тема
          <input
            required
            name="subject"
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            maxLength={200}
          />
        </label>
        <label className="block text-sm">
          Сообщение
          <textarea
            required
            name="body"
            rows={5}
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            maxLength={5000}
          />
        </label>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Создание…" : "Создать"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
}
