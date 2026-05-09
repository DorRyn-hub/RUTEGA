"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, type DialogHandle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SmartCaptcha } from "@/components/marketing/SmartCaptcha";
import { leadSchema, type LeadInput } from "@/lib/validation/lead";
import { trackGoal } from "@/lib/analytics";
import { cn } from "@/lib/cn";

interface CallbackModalProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export function CallbackModal({
  triggerLabel = "Заказать звонок",
  triggerClassName,
}: CallbackModalProps) {
  const dialogRef = useRef<DialogHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source: "callback",
      website: "",
      consent: false as unknown as true,
      consentMarketing: false,
    },
  });

  async function onSubmit(values: LeadInput) {
    const res = await fetch("/api/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, captchaToken }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.push(data.error || "Не удалось отправить заявку. Попробуйте позже.", "error");
      return;
    }
    trackGoal("callback_submitted");
    toast.push("Спасибо! Перезвоним в течение 15 минут.");
    reset({
      source: "callback",
      website: "",
      consent: false as unknown as true,
      consentMarketing: false,
    });
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.open()}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-brand-600)] bg-[var(--color-brand-600)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]",
          triggerClassName,
        )}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3.5 4.5C3.5 3.95 3.95 3.5 4.5 3.5h2.1c.41 0 .77.25.92.62l1 2.5c.13.34.05.72-.21.97l-1.05 1.05a10 10 0 0 0 4.6 4.6l1.05-1.05c.25-.26.63-.34.97-.21l2.5 1c.37.15.62.51.62.92v2.1c0 .55-.45 1-1 1A12.5 12.5 0 0 1 3.5 4.5z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {triggerLabel}
      </button>

      <Dialog
        ref={dialogRef}
        title="Закажите обратный звонок"
        description="Перезвоним в течение 15 минут в рабочее время."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <input type="hidden" {...register("source")} value="callback" />
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1 }}
          >
            <label>
              Не заполняйте это поле
              <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </label>
          </div>

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
            label="Согласен получать новости и спецпредложения"
            {...register("consentMarketing")}
          />

          <SmartCaptcha onVerify={setCaptchaToken} />

          <Button type="submit" loading={isSubmitting} size="lg" fullWidth>
            Перезвоните мне
          </Button>
        </form>
      </Dialog>
    </>
  );
}
