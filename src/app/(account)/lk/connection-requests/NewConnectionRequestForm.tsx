"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function NewConnectionRequestForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const speed = Number(formData.get("speedMbps") ?? "0");
    const res = await fetch("/api/lk/connection-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: String(formData.get("contactName") ?? ""),
        contactPhone: String(formData.get("contactPhone") ?? ""),
        contactEmail: String(formData.get("contactEmail") ?? "") || undefined,
        address: String(formData.get("address") ?? ""),
        serviceType: String(formData.get("serviceType") ?? "internet"),
        speedMbps: Number.isFinite(speed) && speed > 0 ? speed : undefined,
        notes: String(formData.get("notes") ?? "") || undefined,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось создать заявку");
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
            <h2 className="font-semibold">Новый объект</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Укажите адрес и тип услуги — мы проверим тех. возможность и пришлём КП.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>Подать заявку</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold">Новая заявка на подключение</h2>
      <form action={submit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Контактное лицо
            <input
              required
              name="contactName"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Телефон
            <input
              required
              name="contactPhone"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            E-mail
            <input
              type="email"
              name="contactEmail"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Тип услуги
            <select
              name="serviceType"
              defaultValue="internet"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            >
              <option value="internet">Интернет</option>
              <option value="l2vpn">L2-VPN</option>
              <option value="mpls">MPLS</option>
              <option value="hosting">Хостинг в ЦОД</option>
              <option value="colocation">Размещение оборудования</option>
              <option value="other">Другое</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            Адрес объекта
            <input
              required
              name="address"
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
              placeholder="Москва, Цветной бульвар, 25"
            />
          </label>
          <label className="block text-sm">
            Желаемая скорость, Мбит/с
            <input
              type="number"
              name="speedMbps"
              min={1}
              max={100000}
              className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Дополнительно
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <div className="flex gap-2">
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
