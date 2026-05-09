"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  incidentId: string;
  resolved: boolean;
}

export function IncidentControls({ incidentId, resolved }: Props) {
  const [updateStatus, setUpdateStatus] = useState("monitoring");
  const [updateMsg, setUpdateMsg] = useState("");
  const [rfo, setRfo] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function pushUpdate() {
    if (!updateMsg.trim()) return;
    setPending(true);
    await fetch(`/api/admin/incidents/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "update", status: updateStatus, message: updateMsg }),
    });
    setUpdateMsg("");
    setPending(false);
    router.refresh();
  }

  async function resolve() {
    setPending(true);
    await fetch(`/api/admin/incidents/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "resolve", publicRfo: rfo }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="font-semibold">Действия</h2>
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            Статус
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="mt-1 w-44 rounded-[var(--radius-md)] border px-3 py-2 text-sm"
            >
              <option value="investigating">investigating</option>
              <option value="identified">identified</option>
              <option value="monitoring">monitoring</option>
              <option value="scheduled">scheduled</option>
            </select>
          </label>
          <input
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            placeholder="Сообщение для клиентов"
            className="h-10 flex-1 rounded-[var(--radius-md)] border px-3 text-sm"
          />
          <Button onClick={pushUpdate} disabled={pending || !updateMsg.trim()}>
            Опубликовать
          </Button>
        </div>
        {!resolved && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] p-3">
            <p className="text-sm font-medium">Закрыть инцидент с RFO</p>
            <textarea
              value={rfo}
              onChange={(e) => setRfo(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              placeholder="Что произошло, как починили, как предотвратить."
            />
            <Button onClick={resolve} disabled={pending} className="mt-2" variant="primary">
              Закрыть и начислить SLA-компенсации
            </Button>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              При закрытии downtime будет посчитан, затронутым организациям автоматически создадутся компенсации к следующему инвойсу.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
