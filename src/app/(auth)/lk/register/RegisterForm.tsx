"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { consent: false as unknown as true },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
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
          setError(name as keyof RegisterInput, { type: "server", message });
        }
      } else {
        setServerError(data.error || "Не удалось зарегистрироваться.");
      }
      return;
    }
    router.replace("/lk");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
      <Input
        label="Имя"
        autoComplete="name"
        required
        {...register("fullName")}
        error={errors.fullName?.message}
      />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Телефон"
        type="tel"
        autoComplete="tel"
        placeholder="+7 (___) ___-__-__"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <Input
        label="Пароль"
        type="password"
        autoComplete="new-password"
        required
        hint="Минимум 8 символов, заглавная буква и цифра"
        {...register("password")}
        error={errors.password?.message}
      />
      <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-1 h-4 w-4 rounded border-[var(--color-line)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-600)]"
        />
        <span>
          Я согласен на обработку{" "}
          <a href="/legal/privacy" className="underline" target="_blank" rel="noopener noreferrer">
            персональных данных
          </a>{" "}
          в соответствии с{" "}
          <a href="/legal/consent" className="underline" target="_blank" rel="noopener noreferrer">
            152-ФЗ
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p role="alert" className="text-xs font-medium text-[var(--color-danger)]">
          {errors.consent.message}
        </p>
      ) : null}
      {serverError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}
      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        Создать аккаунт
      </Button>
    </form>
  );
}
