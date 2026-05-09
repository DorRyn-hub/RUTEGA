"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ALL_SCOPES = ["read", "write", "billing", "tickets"] as const;

export function ApiKeysPanel() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<Set<string>>(new Set(["read"]));
  const [pending, setPending] = useState(false);
  const [issued, setIssued] = useState<{ plain: string; name: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function toggleScope(scope: string) {
    setScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }

  async function create() {
    setPending(true);
    setErr(null);
    const res = await fetch("/api/lk/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes: Array.from(scopes) }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Не удалось создать ключ");
      return;
    }
    const data = (await res.json()) as { plain: string };
    setIssued({ plain: data.plain, name });
    setName("");
    setScopes(new Set(["read"]));
    router.refresh();
  }

  if (issued) {
    return (
      <Card className="border-[var(--color-warn)] bg-amber-50">
        <h3 className="font-semibold">Ключ создан</h3>
        <p className="mt-1 text-sm">
          Сохраните этот ключ — он показывается один раз и больше не будет доступен.
        </p>
        <code className="mt-3 block break-all rounded bg-white p-2 font-mono text-xs">
          {issued.plain}
        </code>
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(issued.plain)}
          >
            Скопировать
          </Button>
          <Button variant="ghost" onClick={() => setIssued(null)}>
            Закрыть
          </Button>
        </div>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Создать новый ключ</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Каждому ключу назначаются скоупы — что именно ему разрешено читать и менять.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>Создать ключ</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold">Новый API-ключ</h2>
      <div className="mt-3 space-y-3">
        <label className="block text-sm">
          Название
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Zabbix monitoring"
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
          />
        </label>
        <div>
          <p className="text-sm">Разрешения</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_SCOPES.map((scope) => (
              <label
                key={scope}
                className="flex cursor-pointer items-center gap-2 rounded border px-3 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  checked={scopes.has(scope)}
                  onChange={() => toggleScope(scope)}
                />
                {scope}
              </label>
            ))}
          </div>
        </div>
        {err && <p className="text-sm text-[var(--color-danger)]">{err}</p>}
        <div className="flex gap-2">
          <Button onClick={create} disabled={pending || !name || scopes.size === 0}>
            {pending ? "Создание…" : "Создать"}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Отмена
          </Button>
        </div>
      </div>
    </Card>
  );
}
