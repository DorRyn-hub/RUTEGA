"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface EnrollmentData {
  secret: string;
  otpauthUri: string;
  recoveryCodes: string[];
}

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function startEnrollment() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    setPending(false);
    if (!res.ok) {
      setError("Не удалось начать подключение");
      return;
    }
    const data = (await res.json()) as EnrollmentData;
    setEnrollment(data);
  }

  async function confirm() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось подтвердить");
      return;
    }
    setEnrollment(null);
    setCode("");
    router.refresh();
  }

  async function disable() {
    if (!confirmDisable()) return;
    setPending(true);
    await fetch("/api/auth/2fa/disable", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  if (enabled) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="danger" onClick={disable} disabled={pending}>
          Отключить 2FA
        </Button>
        <Button variant="ghost" onClick={startEnrollment} disabled={pending}>
          Сгенерировать новые коды восстановления
        </Button>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="mt-4">
        <Button onClick={startEnrollment} disabled={pending}>
          {pending ? "Готовим…" : "Включить 2FA"}
        </Button>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(enrollment.otpauthUri)}`;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm">
        Отсканируйте QR-код в приложении, либо введите секрет вручную.
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <img
          src={qrUrl}
          alt="QR-код для приложения 2FA"
          className="rounded-[var(--radius-md)] border bg-white p-2"
          width={220}
          height={220}
        />
        <div className="flex-1 min-w-[240px] space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Секрет</p>
            <code className="break-all rounded bg-[var(--color-bg)] px-2 py-1 text-xs">
              {enrollment.secret}
            </code>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              Резервные коды (сохраните!)
            </p>
            <ul className="mt-1 grid grid-cols-2 gap-1 text-xs font-mono">
              {enrollment.recoveryCodes.map((c) => (
                <li key={c} className="rounded bg-[var(--color-bg)] px-2 py-1">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <label className="block text-sm">
            Код из приложения
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              className="mt-1 w-32 rounded-[var(--radius-md)] border px-3 py-2 text-center font-mono tracking-widest"
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </label>
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <Button onClick={confirm} disabled={pending || code.length < 6}>
            {pending ? "Подтверждение…" : "Подтвердить и включить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function confirmDisable(): boolean {
  if (typeof window === "undefined") return false;
  return window.confirm("Отключить 2FA? Защита учётной записи будет ослаблена.");
}
