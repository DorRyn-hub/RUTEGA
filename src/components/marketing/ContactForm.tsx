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
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import { trackGoal } from "@/lib/analytics";

interface ContactFormProps {
  redirectToThanks?: boolean;
}

export function ContactForm({ redirectToThanks = true }: ContactFormProps = {}) {
  const router = useRouter();
  const toast = useToast();
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      website: "",
      consent: false as unknown as true,
      consentMarketing: false,
    },
  });

  async function onSubmit(values: ContactInput) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, captchaToken }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string>;
      };
      const fieldEntries = Object.entries(data.fields ?? {});
      if (fieldEntries.length) {
        for (const [name, message] of fieldEntries) {
          setError(name as keyof ContactInput, { type: "server", message });
        }
      } else {
        toast.push(data.error || "Не удалось отправить сообщение. Попробуйте позже.", "error");
      }
      return;
    }
    trackGoal("contact_submitted");
    toast.push("Сообщение отправлено. Мы скоро ответим!");
    reset({ website: "", consent: false as unknown as true, consentMarketing: false });
    if (redirectToThanks) router.push("/thanks");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="contact-form-title"
    >
      <h3 id="contact-form-title" className="text-2xl font-bold">
        Напишите нам
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Опишите вопрос — ответим на e-mail или перезвоним.
      </p>

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
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>
      <Input
        wrapperClassName="mt-4"
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Textarea
        wrapperClassName="mt-4"
        label="Сообщение"
        rows={5}
        {...register("message")}
        error={errors.message?.message}
      />

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

      <SmartCaptcha onVerify={setCaptchaToken} className="mt-4" />

      <Button type="submit" loading={isSubmitting} className="mt-5" size="lg" fullWidth>
        Отправить
      </Button>
    </form>
  );
}
