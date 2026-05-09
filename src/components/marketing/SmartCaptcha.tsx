"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    smartCaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          hl?: string;
          invisible?: boolean;
          shieldPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
          test?: boolean;
        },
      ) => number;
      execute?: (widgetId: number) => void;
      reset?: (widgetId: number) => void;
      destroy?: (widgetId: number) => void;
    };
    __smartCaptchaCallbacks?: Record<string, () => void>;
  }
}

interface SmartCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  invisible?: boolean;
  className?: string;
}

const SCRIPT_SRC = "https://smartcaptcha.yandexcloud.net/captcha.js";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.smartCaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("smartcaptcha failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("smartcaptcha failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Yandex SmartCaptcha. Если NEXT_PUBLIC_SMARTCAptCHA_SITE_KEY не задан —
 * рендерит ничего и сразу вызывает onVerify("dev-bypass") (для локальной разработки).
 */
export function SmartCaptcha({ onVerify, onExpire, invisible, className }: SmartCaptchaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  }, [onVerify, onExpire]);

  const sitekey = process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!sitekey) {
      // dev-режим: пропускаем капчу
      onVerifyRef.current("dev-bypass");
      return;
    }
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.smartCaptcha || !ref.current) return;
        widgetIdRef.current = window.smartCaptcha.render(ref.current, {
          sitekey,
          invisible,
          callback: (token) => onVerifyRef.current(token),
        });
      })
      .catch(() => {
        // если CDN Я.Облака недоступен — не блокируем форму, шлём пометку
        onVerifyRef.current("captcha-unavailable");
      });
    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id !== null && window.smartCaptcha?.destroy) {
        try {
          window.smartCaptcha.destroy(id);
        } catch {
          /* noop */
        }
      }
    };
  }, [sitekey, invisible]);

  if (!sitekey) {
    return null;
  }

  return <div ref={ref} className={className} />;
}
