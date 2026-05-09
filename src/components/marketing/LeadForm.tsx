"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SmartCaptcha } from "@/components/marketing/SmartCaptcha";
import { leadSchema, type LeadInput } from "@/lib/validation/lead";
import { trackGoal } from "@/lib/analytics";

interface LeadFormProps {
  source?: "callback" | "tariff" | "contact" | "calculator";
  tariffSlug?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  /** "simple" (по умолчанию) — имя+телефон. "two-step" — добавляет шаг 2 с ИНН и компанией. */
  variant?: "simple" | "two-step";
  /** Перенаправлять на /thanks после успешной отправки. */
  redirectToThanks?: boolean;
}

export function LeadForm({
  source = "callback",
  tariffSlug,
  title = "Заказать звонок",
  description = "Перезвоним в течение 15 минут в рабочее время.",
  submitLabel = "Перезвоните мне",
  variant = "simple",
  redirectToThanks = false,
}: LeadFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source,
      tariffSlug,
      website: "",
      consent: false as unknown as true,
      consentMarketing: false,
    },
  });

  async function onSubmit(values: LeadInput) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, captchaToken }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.push(data.error || "Не удалось отправить заявку. Попробуйте позже.", "error");
      return;
    }
    trackGoal("lead_submitted", { source });
    toast.push("Спасибо! Мы свяжемся с вами в ближайшее время.");
    reset({
      source,
      tariffSlug,
      website: "",
      consent: false as unknown as true,
      consentMarketing: false,
    });
    setStep(1);
    if (redirectToThanks) router.push("/thanks");
  }

  async function nextStep() {
    const ok = await trigger(["name", "phone", "consent"]);
    if (ok) setStep(2);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="lead-form-title"
    >
      <h3 id="lead-form-title" className="text-2xl font-bold">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>

      {variant === "two-step" ? (
        <ol
          className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]"
          aria-label="Шаги формы"
        >
          <li
            className={
              step === 1
                ? "rounded-full bg-[var(--color-brand-600)] px-2.5 py-0.5 text-white"
                : "rounded-full bg-[var(--color-bg)] px-2.5 py-0.5"
            }
          >
            1. Контакт
          </li>
          <li aria-hidden="true">→</li>
          <li
            className={
              step === 2
                ? "rounded-full bg-[var(--color-brand-600)] px-2.5 py-0.5 text-white"
                : "rounded-full bg-[var(--color-bg)] px-2.5 py-0.5"
            }
          >
            2. О компании
          </li>
        </ol>
      ) : null}

      <input type="hidden" {...register("source")} value={source} />
      {tariffSlug ? <input type="hidden" {...register("tariffSlug")} value={tariffSlug} /> : null}

      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1 }}
      >
        <label>
          Не заполняйте это поле
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {step === 1 ? (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Имя"
              required
              autoComplete="name"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Телефон"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>

          {variant === "two-step" ? (
            <Textarea
              wrapperClassName="mt-4"
              label="Комментарий"
              rows={3}
              placeholder="Что подключаем и куда?"
              {...register("message")}
              error={errors.message?.message}
            />
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            <Checkbox
              label={
                <>
                  Согласен на обработку{" "}
                  <a
                    href="/legal/privacy"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    персональных данных
                  </a>{" "}
                  в соответствии с{" "}
                  <a
                    href="/legal/consent"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    152-ФЗ
                  </a>
                  .
                </>
              }
              required
              {...register("consent")}
              error={errors.consent?.message}
            />
            <Checkbox
              label="Получать новости и спецпредложения"
              {...register("consentMarketing")}
            />
          </div>

          {variant === "two-step" ? (
            <Button
              type="button"
              onClick={nextStep}
              className="mt-5"
              size="lg"
              fullWidth
            >
              Дальше
            </Button>
          ) : (
            <>
              <SmartCaptcha onVerify={setCaptchaToken} className="mt-4" />
              <Button type="submit" loading={isSubmitting} className="mt-5" size="lg" fullWidth>
                {submitLabel}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Название компании"
              autoComplete="organization"
              {...register("companyName")}
              error={errors.companyName?.message}
            />
            <Input
              label="ИНН"
              inputMode="numeric"
              hint="10 цифр для юрлица, 12 — для ИП"
              {...register("inn")}
              error={errors.inn?.message}
            />
          </div>
          <Input
            wrapperClassName="mt-4"
            label="E-mail"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <SmartCaptcha onVerify={setCaptchaToken} className="mt-4" />

          <div className="mt-5 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)} size="lg">
              Назад
            </Button>
            <Button type="submit" loading={isSubmitting} size="lg" className="flex-1">
              {submitLabel}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
