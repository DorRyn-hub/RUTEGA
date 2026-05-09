"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { LinkButton } from "@/components/ui/Button";
import {
  calculateQuote,
  formatRub,
  type CalcAddon,
  type CalcServiceType,
} from "@/lib/calculator";

const SERVICE_LABELS: Record<CalcServiceType, string> = {
  internet: "Интернет для бизнеса",
  l2vpn: "L2/L3-VPN между офисами",
  radio: "Радиоканал PtP / PtMP",
  colocation: "Colocation / размещение в ЦОД",
};

const SPEED_OPTIONS_BY_SERVICE: Record<CalcServiceType, number[]> = {
  internet: [100, 200, 500, 1000, 2000, 5000, 10000],
  l2vpn: [100, 200, 500, 1000, 2000, 5000],
  radio: [100, 200, 500, 1000],
  colocation: [100], // не используется, скрываем
};

const ADDONS_BY_SERVICE: Record<CalcServiceType, CalcAddon[]> = {
  internet: ["static_ip", "backup_channel", "ddos_protection", "ip_telephony"],
  l2vpn: ["backup_channel", "static_ip"],
  radio: ["backup_channel", "static_ip"],
  colocation: ["rack_unit", "ddos_protection"],
};

const ADDON_LABELS: Record<CalcAddon, string> = {
  static_ip: "Статический IP",
  backup_channel: "Резервный канал",
  ddos_protection: "Защита от DDoS",
  ip_telephony: "IP-телефония",
  rack_unit: "Дополнительный юнит",
};

export function CostCalculator() {
  const [serviceType, setServiceType] = useState<CalcServiceType>("internet");
  const [speedMbps, setSpeedMbps] = useState<number>(500);
  const [addons, setAddons] = useState<Set<CalcAddon>>(new Set());

  const result = useMemo(
    () => calculateQuote({ serviceType, speedMbps, addons: Array.from(addons) }),
    [serviceType, speedMbps, addons],
  );

  const showSpeed = serviceType !== "colocation";
  const speedOptions = SPEED_OPTIONS_BY_SERVICE[serviceType];
  const addonOptions = ADDONS_BY_SERVICE[serviceType];

  function toggleAddon(a: CalcAddon) {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  function changeService(value: string) {
    const next = value as CalcServiceType;
    setServiceType(next);
    setAddons(new Set());
    const opts = SPEED_OPTIONS_BY_SERVICE[next];
    const fallback = opts[0] ?? 100;
    if (!opts.includes(speedMbps)) setSpeedMbps(fallback);
  }

  return (
    <section
      aria-labelledby="calc-title"
      className="rounded-[var(--radius-xl)] border bg-white p-6 shadow-sm sm:p-8"
    >
      <header className="mb-6">
        <h2 id="calc-title" className="font-display text-2xl font-bold sm:text-3xl">
          Калькулятор стоимости
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Ориентировочная цена «от». Точную считает менеджер после обследования адреса.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Select
            label="Тип услуги"
            value={serviceType}
            onChange={(e) => changeService(e.target.value)}
          >
            {Object.entries(SERVICE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>

          {showSpeed ? (
            <Select
              label="Скорость канала"
              value={String(speedMbps)}
              onChange={(e) => setSpeedMbps(Number(e.target.value))}
            >
              {speedOptions.map((mb) => (
                <option key={mb} value={mb}>
                  {mb >= 1000 ? `${mb / 1000} Гбит/с` : `${mb} Мбит/с`}
                </option>
              ))}
            </Select>
          ) : null}

          {addonOptions.length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-[var(--color-ink)]">
                Дополнительные опции
              </legend>
              {addonOptions.map((a) => (
                <Checkbox
                  key={a}
                  label={ADDON_LABELS[a]}
                  checked={addons.has(a)}
                  onChange={() => toggleAddon(a)}
                />
              ))}
            </fieldset>
          ) : null}
        </div>

        <aside
          className="flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-brand-50)] p-5"
          aria-live="polite"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-700)]">
            Ежемесячно от
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-[var(--color-brand-800)] sm:text-4xl">
            {formatRub(result.monthlyKop)}
          </div>
          {result.oneOffKop > 0 ? (
            <div className="mt-2 text-sm text-[var(--color-ink)]">
              Подключение от{" "}
              <span className="font-semibold">{formatRub(result.oneOffKop)}</span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-[var(--color-success)]">
              Подключение бесплатно
            </div>
          )}

          {result.notes.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-xs text-[var(--color-muted)]">
              {result.notes.map((n, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden="true">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <LinkButton
            href={`/contacts?service=${serviceType}&speed=${speedMbps}`}
            size="lg"
            className="mt-4"
            fullWidth
          >
            Оставить заявку
          </LinkButton>
        </aside>
      </div>
    </section>
  );
}
