"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatRubPerMonth } from "@/lib/format";
import type { UserServiceDTO } from "@/types/domain";

const STATUS_LABEL: Record<UserServiceDTO["status"], { label: string; tone: "success" | "warn" | "neutral" }> = {
  active: { label: "Активна", tone: "success" },
  paused: { label: "На паузе", tone: "warn" },
  pending: { label: "Подключается", tone: "neutral" },
};

export function MyServicesList({ items }: { items: UserServiceDTO[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function disconnect(id: string) {
    if (!confirm("Отключить услугу? Это действие можно отменить, обратившись в поддержку.")) return;
    setBusyId(id);
    const res = await fetch("/api/user-services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.push(data.error || "Не удалось отключить услугу", "error");
      return;
    }
    toast.push("Услуга отключена");
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const status = STATUS_LABEL[s.status];
        return (
          <li key={s.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{s.serviceTitle}</p>
                <p className="text-sm text-[var(--color-muted)]">Тариф «{s.tariffTitle}»</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <span className="text-sm font-semibold">{formatRubPerMonth(s.priceRub)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnect(s.id)}
                loading={busyId === s.id}
                className="text-[var(--color-danger)] hover:bg-red-50"
              >
                Отключить
              </Button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
