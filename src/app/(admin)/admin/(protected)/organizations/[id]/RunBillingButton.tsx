"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RunBillingButton({ organizationId }: { organizationId: string }) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setPending(true);
    setMsg(null);
    const res = await fetch("/api/admin/billing/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId }),
    });
    const j = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setMsg(j.error ?? "Ошибка");
      return;
    }
    if (j.invoiceCreated) {
      setMsg("Счёт сгенерирован");
      router.refresh();
    } else {
      setMsg("В этом периоде уже выставлен или нет позиций");
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
        {pending ? "Считаем…" : "Прогнать биллинг за текущий месяц"}
      </Button>
      {msg && <span className="text-xs text-[var(--color-muted)]">{msg}</span>}
    </div>
  );
}
