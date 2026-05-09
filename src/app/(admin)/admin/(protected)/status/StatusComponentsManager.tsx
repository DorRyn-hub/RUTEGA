"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { StatusComponentDTO } from "@/types/domain";

const STATUS_OPTIONS: StatusComponentDTO["currentStatus"][] = [
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
  "maintenance",
];

export function StatusComponentsManager({ components }: { components: StatusComponentDTO[] }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function changeStatus(id: string, currentStatus: string) {
    setPending(true);
    await fetch(`/api/admin/status-components/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentStatus }),
    });
    setPending(false);
    router.refresh();
  }

  async function create(formData: FormData) {
    setPending(true);
    await fetch("/api/admin/status-components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: String(formData.get("slug") ?? ""),
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? "") || undefined,
        group: String(formData.get("group") ?? "") || undefined,
        order: Number(formData.get("order") ?? "0"),
      }),
    });
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Удалить компонент?")) return;
    setPending(true);
    await fetch(`/api/admin/status-components/${id}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {!open ? (
          <Button onClick={() => setOpen(true)}>Добавить компонент</Button>
        ) : (
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Отмена
          </Button>
        )}
      </div>
      {open && (
        <form action={create} className="mb-4 grid gap-2 rounded border p-3 sm:grid-cols-2">
          <Field name="slug" label="slug" />
          <Field name="name" label="Название" />
          <Field name="group" label="Группа" />
          <Field name="order" label="Порядок" type="number" defaultValue="0" />
          <Field name="description" label="Описание" className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              Создать
            </Button>
          </div>
        </form>
      )}
      <ul className="divide-y">
        {components.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {c.group ?? "—"} · slug: {c.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={c.currentStatus === "operational" ? "success" : "warn"}>
                {c.currentStatus}
              </Badge>
              <select
                value={c.currentStatus}
                onChange={(e) => changeStatus(c.id, e.target.value)}
                disabled={pending}
                className="h-9 rounded-[var(--radius-md)] border px-2 text-xs"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                onClick={() => remove(c.id)}
                disabled={pending}
                className="text-xs text-[var(--color-danger)] hover:underline"
              >
                удалить
              </button>
            </div>
          </li>
        ))}
        {components.length === 0 && (
          <li className="py-6 text-center text-[var(--color-muted)]">Компонентов нет.</li>
        )}
      </ul>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={"text-sm " + (className ?? "")}>
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
      />
    </label>
  );
}
