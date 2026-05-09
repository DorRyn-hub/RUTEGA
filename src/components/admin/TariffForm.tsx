"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StringListInput } from "./StringListInput";

interface ServiceOption {
  id: string;
  title: string;
}

interface TariffInitial {
  id?: string;
  serviceId?: string;
  slug?: string;
  title?: string;
  speedMbps?: number | null;
  priceRub?: number;
  perks?: string[];
  highlight?: boolean;
  order?: number;
}

interface Props {
  initial?: TariffInitial;
  services: ServiceOption[];
}

export function TariffForm({ initial, services }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? services[0]?.id ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [speedMbps, setSpeedMbps] = useState<string>(
    initial?.speedMbps != null ? String(initial.speedMbps) : "",
  );
  const [priceRub, setPriceRub] = useState<number>(initial?.priceRub ?? 0);
  const [perks, setPerks] = useState<string[]>(initial?.perks ?? []);
  const [highlight, setHighlight] = useState<boolean>(Boolean(initial?.highlight));
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/tariffs/${initial!.id}` : "/api/admin/tariffs";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          slug,
          title,
          speedMbps: speedMbps === "" ? null : Number(speedMbps),
          priceRub: Number(priceRub),
          perks,
          highlight,
          order: Number(order) || 0,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Record<string, string>;
        };
        setErrors(data.fields ?? {});
        setServerError(data.error || "Ошибка сохранения");
        return;
      }
      router.replace("/admin/tariffs");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-ink)]">Услуга</label>
        <select
          className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
          required
        />
        <Input
          label="Название тарифа"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Скорость (Мбит/с)"
          type="number"
          value={speedMbps}
          onChange={(e) => setSpeedMbps(e.target.value)}
          hint="Оставьте пустым, если не применимо"
        />
        <Input
          label="Цена, ₽"
          type="number"
          value={priceRub}
          onChange={(e) => setPriceRub(Number(e.target.value))}
          required
        />
        <Input
          label="Порядок"
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={highlight}
          onChange={(e) => setHighlight(e.target.checked)}
        />
        Выделять как рекомендованный
      </label>
      <StringListInput
        label="Что входит"
        value={perks}
        onChange={setPerks}
        placeholder="Безлимитный трафик"
      />
      {serverError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {isEdit ? "Сохранить" : "Создать"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
