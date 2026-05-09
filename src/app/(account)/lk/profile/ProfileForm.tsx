"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  fullName: z.string().min(2, "Укажите имя"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine(
      (v) => v === undefined || /^\+?[0-9 ()-]{7,20}$/.test(v),
      "Некорректный номер телефона",
    ),
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
  fullName: string;
  phone: string;
  email: string;
}

export function ProfileForm({ fullName, phone, email }: ProfileFormProps) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName, phone },
  });

  async function onSubmit(values: FormData) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
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
          setError(name as keyof FormData, { type: "server", message });
        }
      } else {
        toast.push(data.error || "Не удалось сохранить", "error");
      }
      return;
    }
    toast.push("Изменения сохранены");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Имя"
        autoComplete="name"
        required
        {...register("fullName")}
        error={errors.fullName?.message}
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
        label="E-mail"
        value={email}
        readOnly
        hint="Для смены e-mail обратитесь в поддержку"
      />
      <Button type="submit" loading={isSubmitting} disabled={!isDirty} size="md">
        Сохранить
      </Button>
    </form>
  );
}
