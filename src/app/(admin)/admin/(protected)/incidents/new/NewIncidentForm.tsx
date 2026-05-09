"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { StatusComponentDTO } from "@/types/domain";

interface Props {
  services: { id: string; title: string }[];
  components: StatusComponentDTO[];
}

export function NewIncidentForm({ services, components }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const router = useRouter();

  function toggleComponent(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: String(formData.get("serviceId") ?? "") || undefined,
        title: String(formData.get("title") ?? ""),
        summary: String(formData.get("summary") ?? ""),
        severity: String(formData.get("severity") ?? "minor"),
        componentSlugs: Array.from(selected),
        isPublic: formData.get("isPublic") === "on",
      }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Ошибка");
      return;
    }
    router.push("/admin/incidents");
  }

  return (
    <form action={submit} className="space-y-3">
      <label className="block text-sm">
        Заголовок
        <input
          required
          name="title"
          className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Описание
        <textarea
          required
          name="summary"
          rows={3}
          className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Услуга (опционально)
          <select name="serviceId" className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2">
            <option value="">— не указана —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Серьёзность
          <select
            name="severity"
            defaultValue="minor"
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
          >
            <option value="minor">Низкая</option>
            <option value="major">Высокая</option>
            <option value="critical">Критичная</option>
            <option value="maintenance">Плановые работы</option>
          </select>
        </label>
      </div>
      <div>
        <p className="text-sm font-medium">Затронутые компоненты</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {components.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(c.slug)}
                onChange={() => toggleComponent(c.slug)}
              />
              {c.name}
              <span className="text-xs text-[var(--color-muted)]">({c.group})</span>
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked />
        Показывать на публичной status-странице
      </label>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Создание…" : "Создать инцидент"}
      </Button>
    </form>
  );
}
