"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

interface LoginFormProps {
  from?: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function navigateAfterLogin(role: string | undefined) {
    const dest =
      role === "admin"
        ? from && from.startsWith("/admin")
          ? from
          : "/admin"
        : from && from.startsWith("/lk")
          ? from
          : "/lk";
    router.replace(dest);
    router.refresh();
  }

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string>;
      };
      const fieldEntries = Object.entries(data.fields ?? {});
      if (fieldEntries.length) {
        for (const [name, message] of fieldEntries) {
          setError(name as keyof LoginInput, { type: "server", message });
        }
      } else {
        setServerError(data.error || "Не удалось войти. Попробуйте позже.");
      }
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      user?: { role?: string };
      requires2fa?: boolean;
    };
    if (data.requires2fa) {
      setNeeds2fa(true);
      return;
    }
    await navigateAfterLogin(data.user?.role);
  }

  async function verify2fa(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setServerError(null);
    const res = await fetch("/api/auth/login-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    setVerifying(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error || "Неверный код");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { user?: { role?: string } };
    await navigateAfterLogin(data.user?.role);
  }

  if (needs2fa) {
    return (
      <form onSubmit={verify2fa} noValidate className="mt-6 space-y-4">
        <p className="rounded-[var(--radius-md)] border bg-[var(--color-bg)] p-3 text-sm">
          Введите 6-значный код из приложения 2FA. Если приложение недоступно — введите один из резервных кодов.
        </p>
        <Input
          label="Код"
          autoComplete="one-time-code"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        {serverError && (
          <p role="alert" className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={verifying} fullWidth size="lg">
          Подтвердить
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
      <Input
        label="E-mail или логин"
        type="text"
        autoComplete="username"
        required
        {...register("identifier")}
        error={errors.identifier?.message}
      />
      <Input
        label="Пароль"
        type="password"
        autoComplete="current-password"
        required
        {...register("password")}
        error={errors.password?.message}
      />
      {serverError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}
      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        Войти
      </Button>
    </form>
  );
}
