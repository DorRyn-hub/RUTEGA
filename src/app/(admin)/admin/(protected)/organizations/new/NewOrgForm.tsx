"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function NewOrgForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inn: String(formData.get("inn") ?? "").trim(),
        kpp: String(formData.get("kpp") ?? "").trim() || undefined,
        ogrn: String(formData.get("ogrn") ?? "").trim() || undefined,
        legalName: String(formData.get("legalName") ?? "").trim(),
        shortName: String(formData.get("shortName") ?? "").trim() || undefined,
        legalAddress: String(formData.get("legalAddress") ?? "").trim(),
        contactEmail: String(formData.get("contactEmail") ?? "").trim() || undefined,
        contactPhone: String(formData.get("contactPhone") ?? "").trim() || undefined,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Ошибка");
      return;
    }
    const data = (await res.json()) as { org: { id: string } };
    router.push(`/admin/organizations/${data.org.id}`);
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-2">
      <Field name="inn" label="ИНН" required />
      <Field name="kpp" label="КПП" />
      <Field name="ogrn" label="ОГРН" />
      <Field name="legalName" label="Полное наименование" required />
      <Field name="shortName" label="Краткое наименование" />
      <Field name="legalAddress" label="Юр. адрес" required className="sm:col-span-2" />
      <Field name="contactEmail" label="E-mail" type="email" />
      <Field name="contactPhone" label="Телефон" />
      {error && <p className="sm:col-span-2 text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Создание…" : "Создать организацию"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={"text-sm " + (className ?? "")}>
      {label}
      {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full rounded-[var(--radius-md)] border bg-white px-3 py-2"
      />
    </label>
  );
}
