"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  requestId: string;
  currentStatus: string;
  serviceType: string;
  speedMbps: number | null;
}

export function ConnectionControls({ requestId, currentStatus, serviceType, speedMbps }: Props) {
  const [pending, setPending] = useState(false);
  const [availability, setAvailability] = useState<"available" | "partial" | "unavailable">("available");
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [status, setStatus] = useState(currentStatus);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function call(payload: object): Promise<unknown> {
    setPending(true);
    setMsg(null);
    const res = await fetch(`/api/admin/connection-requests/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Ошибка");
      return null;
    }
    router.refresh();
    return res.json().catch(() => ({}));
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">1. Тех. обследование</h3>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as typeof availability)}
            className="h-10 rounded-[var(--radius-md)] border px-3 text-sm"
          >
            <option value="available">Подключение возможно</option>
            <option value="partial">Возможно с условиями</option>
            <option value="unavailable">Невозможно</option>
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Комментарий: тип канала, расстояние, сроки…"
            className="h-10 flex-1 rounded-[var(--radius-md)] border px-3 text-sm"
          />
          <Button
            onClick={() => call({ op: "survey", availability, notes })}
            disabled={pending}
          >
            Сохранить обследование
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">2. Расчёт КП</h3>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <input
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Расстояние до точки, м"
            type="number"
            className="h-10 w-48 rounded-[var(--radius-md)] border px-3 text-sm"
          />
          <Button
            variant="secondary"
            onClick={() =>
              call({
                op: "quote",
                serviceType,
                speedMbps: speedMbps ?? 100,
                distanceMeters: distance ? Number(distance) : undefined,
              })
            }
            disabled={pending}
          >
            Сгенерировать КП
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">3. Статус</h3>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-[var(--radius-md)] border px-3 text-sm"
          >
            <option value="new">Новая</option>
            <option value="survey">Обследование</option>
            <option value="quoted">Выставлен КП</option>
            <option value="accepted">Принято</option>
            <option value="rejected">Отказ</option>
            <option value="active">Подключено</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => call({ op: "status", status })}
            disabled={pending}
          >
            Обновить статус
          </Button>
        </div>
      </div>
      {msg && <p className="text-sm text-[var(--color-muted)]">{msg}</p>}
    </Card>
  );
}
