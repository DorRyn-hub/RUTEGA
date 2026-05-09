"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { OrganizationDTO, AccountSummaryDTO } from "@/types/domain";

interface Props {
  org: OrganizationDTO;
  accountSummary: AccountSummaryDTO | null;
}

export function OrgEditForm({ org, accountSummary }: Props) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function submit(formData: FormData) {
    setPending(true);
    setMsg(null);
    const payload: Record<string, unknown> = {
      legalName: formData.get("legalName"),
      shortName: formData.get("shortName"),
      legalAddress: formData.get("legalAddress"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      kpp: formData.get("kpp"),
      ogrn: formData.get("ogrn"),
      status: formData.get("status"),
      twoFactorRequired: formData.get("twoFactorRequired") === "on",
    };
    const limit = formData.get("creditLimitRub");
    if (limit) payload.creditLimitKop = Math.round(Number(limit) * 100);

    const res = await fetch(`/api/admin/organizations/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (res.ok) {
      setMsg("Сохранено");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Ошибка");
    }
  }

  return (
    <Card>
      <h2 className="font-semibold">Реквизиты и настройки</h2>
      <form action={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="legalName" label="Полное наименование" defaultValue={org.legalName} />
        <Field name="shortName" label="Краткое наименование" defaultValue={org.shortName ?? ""} />
        <Field name="kpp" label="КПП" defaultValue={org.kpp ?? ""} />
        <Field name="ogrn" label="ОГРН" defaultValue={org.ogrn ?? ""} />
        <Field name="legalAddress" label="Юр. адрес" defaultValue={org.legalAddress} />
        <Field name="contactEmail" label="E-mail" type="email" defaultValue={org.contactEmail ?? ""} />
        <Field name="contactPhone" label="Телефон" defaultValue={org.contactPhone ?? ""} />
        <label className="text-sm">
          Статус
          <select
            name="status"
            defaultValue={org.status}
            className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
          >
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <Field
          name="creditLimitRub"
          label="Кредитный лимит, ₽"
          type="number"
          defaultValue={accountSummary ? String(accountSummary.creditLimitKop / 100) : "0"}
        />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="twoFactorRequired"
            defaultChecked={org.twoFactorRequired}
          />
          Требовать 2FA для всех сотрудников
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Сохранение…" : "Сохранить"}
          </Button>
          {msg && <span className="text-sm text-[var(--color-muted)]">{msg}</span>}
        </div>
      </form>
    </Card>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-[var(--radius-md)] border px-3 py-2"
      />
    </label>
  );
}
