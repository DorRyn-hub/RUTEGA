"use client";

import dynamic from "next/dynamic";

// Карта рендерится только на клиенте — Yandex Maps SDK тяжёлый и не нужен в SSR.
// `ssr: false` запрещён в Server Components, поэтому держим обёртку отдельно.
const CoverageMap = dynamic(
  () => import("@/components/marketing/CoverageMap").then((m) => m.CoverageMap),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Загрузка карты"
        className="h-[60vh] min-h-[420px] w-full animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg)]"
      />
    ),
  },
);

export function CoverageMapClient() {
  return <CoverageMap />;
}
