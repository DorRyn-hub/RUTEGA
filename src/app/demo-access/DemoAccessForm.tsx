"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  from: string;
}

export function DemoAccessForm({ from }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Не удалось войти. Попробуйте позже.");
        return;
      }
      const dest = from && from.startsWith("/") && !from.startsWith("/demo-access") ? from : "/";
      startTransition(() => {
        router.replace(dest);
        router.refresh();
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
      <Input
        label="Логин"
        type="text"
        autoComplete="username"
        autoFocus
        required
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <Input
        label="Пароль"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting || isPending} fullWidth size="lg">
        Войти в демо
      </Button>
    </form>
  );
}
