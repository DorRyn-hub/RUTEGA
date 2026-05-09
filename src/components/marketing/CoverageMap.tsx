"use client";

import { useEffect, useRef, useState } from "react";
import type { CoverageFeatureCollection } from "@/types/domain";
import { cn } from "@/lib/cn";

declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

interface YMaps {
  ready: (cb: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: { center: [number, number]; zoom: number; controls?: string[] },
    options?: Record<string, unknown>,
  ) => YMap;
  Placemark: new (
    coords: [number, number],
    properties: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => unknown;
}

interface YMap {
  geoObjects: { add: (obj: unknown) => void; removeAll: () => void };
  destroy: () => void;
}

const COLORS: Record<"optic" | "radio" | "pop", string> = {
  optic: "islands#blueCircleIcon",
  radio: "islands#orangeCircleIcon",
  pop: "islands#redStretchyIcon",
};

const TYPE_LABELS: Record<"optic" | "radio" | "pop", string> = {
  optic: "Оптика",
  radio: "Радиоканал",
  pop: "POP-узел",
};

let scriptPromise: Promise<void> | null = null;

function loadYandexMapsScript(apiKey: string | undefined): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.ymaps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  const params = new URLSearchParams({ lang: "ru_RU" });
  if (apiKey) params.set("apikey", apiKey);
  const src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-rutega-ymaps]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("ymaps load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.rutegaYmaps = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("ymaps load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function CoverageMap({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    async function init() {
      try {
        await loadYandexMapsScript(apiKey);
        if (cancelled) return;
        const ymaps = window.ymaps;
        if (!ymaps || !containerRef.current) {
          setError("Яндекс.Карты не загрузились. Попробуйте перезагрузить страницу.");
          setLoading(false);
          return;
        }
        ymaps.ready(async () => {
          if (cancelled || !containerRef.current) return;
          const map = new ymaps.Map(
            containerRef.current,
            {
              center: [55.751244, 37.618423], // Москва, центр
              zoom: 10,
              controls: ["zoomControl", "fullscreenControl", "geolocationControl"],
            },
          );
          mapRef.current = map;

          // Загружаем точки покрытия
          const res = await fetch("/api/coverage");
          if (!res.ok) {
            setError("Не удалось загрузить точки покрытия.");
            setLoading(false);
            return;
          }
          const data = (await res.json()) as CoverageFeatureCollection;

          for (const f of data.features) {
            if (f.geometry.type !== "Point") continue;
            const [lng, lat] = f.geometry.coordinates as [number, number];
            const t = f.properties.type;
            const placemark = new ymaps.Placemark(
              [lat, lng],
              {
                balloonContentHeader: f.properties.title ?? TYPE_LABELS[t],
                balloonContentBody: `
                  <div style="font-size:13px;line-height:1.4">
                    <div><strong>${TYPE_LABELS[t]}</strong></div>
                    ${f.properties.title ? `<div>${escapeHtml(f.properties.title)}</div>` : ""}
                  </div>
                  <div style="margin-top:8px">
                    <a href="/contacts?source=coverage" style="color:#0747b5;font-weight:600">
                      Узнать о подключении →
                    </a>
                  </div>
                `,
                hintContent: f.properties.title ?? TYPE_LABELS[t],
              },
              { preset: COLORS[t], iconColor: undefined },
            );
            map.geoObjects.add(placemark);
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("ymaps init error", e);
        setError("Не удалось загрузить карту. Проверьте подключение к интернету.");
        setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch {
          /* noop */
        }
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="h-[60vh] min-h-[420px] w-full rounded-[var(--radius-lg)] bg-[var(--color-bg)]"
        role="application"
        aria-label="Карта покрытия Rutega"
      />
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-[var(--color-muted)]">
          Загружаем карту…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center rounded-[var(--radius-lg)] bg-white/90 p-4 text-center text-sm text-[var(--color-danger)]">
          {error}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
        <Legend color="#1a73e8" label="Оптические зоны" />
        <Legend color="#f59e0b" label="Радиоканалы" />
        <Legend color="#dc2626" label="POP-узлы" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
