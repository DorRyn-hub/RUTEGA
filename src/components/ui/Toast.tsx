"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastApi {
  push(message: string, tone?: Tone): void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-3 rounded-[var(--radius-md)] border bg-white p-3.5 shadow-lg",
              t.tone === "success"
                ? "border-emerald-200"
                : "border-red-200",
            )}
            style={{ animation: "fade-in-up 0.25s ease-out" }}
          >
            {t.tone === "success" ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 text-red-600" />
            )}
            <p className="text-sm">{t.message}</p>
            <button
              type="button"
              aria-label="Закрыть уведомление"
              className="ml-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              onClick={() => dismiss(t.id)}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
