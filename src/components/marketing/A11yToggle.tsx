"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "rutega-a11y";

function applyA11y(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("a11y", enabled);
}

export function A11yToggle({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "1") {
        setEnabled(true);
        applyA11y(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    applyA11y(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* noop */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? "Обычная версия сайта" : "Версия для слабовидящих"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-700)]",
        enabled && "border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-800)]",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 6v4l3 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline">{enabled ? "Обычная версия" : "Для слабовидящих"}</span>
    </button>
  );
}
