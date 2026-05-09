"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RunAllBillingButton() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setPending(true);
    setMsg(null);
    const res = await fetch("/api/admin/billing/run", { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } });
    const j = (await res.json().catch(() => ({}))) as {
      invoicesCreated?: number;
      chargesCreated?: number;
      totalKop?: number;
    };
    setPending(false);
    if (!res.ok) {
      setMsg("Ошибка");
      return;
    }
    setMsg(
      `Создано инвойсов: ${j.invoicesCreated ?? 0}, проводок: ${j.chargesCreated ?? 0}`,
    );
    router.refresh();
  }

  return (
    <div className="mt-2">
      <Button onClick={run} disabled={pending} size="sm">
        {pending ? "Считаем…" : "Прогнать за текущий месяц"}
      </Button>
      {msg && <p className="mt-2 text-xs text-[var(--color-muted)]">{msg}</p>}
    </div>
  );
}
