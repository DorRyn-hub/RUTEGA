"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface UserOption {
  id: string;
  email: string;
  fullName: string;
}

interface BillInitial {
  id?: string;
  userId?: string;
  amount?: number;
  status?: "paid" | "due" | "overdue";
  period?: string;
  paidAt?: string | null;
}

interface Props {
  initial?: BillInitial;
  users: UserOption[];
}

export function BillForm({ initial, users }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [userId, setUserId] = useState(initial?.userId ?? users[0]?.id ?? "");
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [status, setStatus] = useState<"paid" | "due" | "overdue">(
    initial?.status ?? "due",
  );
  const [period, setPeriod] = useState(
    initial?.period ?? new Date().toISOString().slice(0, 7),
  );
  const [paidAt, setPaidAt] = useState(initial?.paidAt ? initial.paidAt.slice(0, 10) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/bills/${initial!.id}` : "/api/admin/bills";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
          status,
          period,
          paidAt: paidAt ? new Date(paidAt).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Record<string, string>;
        };
        setErrors(data.fields ?? {});
        setServerError(data.error || "Ошибка сохранения");
        return;
      }
      router.replace("/admin/bills");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-ink)]">Пользователь</label>
        <select
          className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} — {u.email}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Сумма, ₽ (в копейках/рублях по схеме)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          error={errors.amount}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-ink)]">Статус</label>
          <select
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "paid" | "due" | "overdue")
            }
          >
            <option value="due">due</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>
        </div>
        <Input
          label="Период (YYYY-MM)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          error={errors.period}
          required
        />
      </div>
      <Input
        label="Дата оплаты"
        type="date"
        value={paidAt}
        onChange={(e) => setPaidAt(e.target.value)}
        error={errors.paidAt}
        hint="Только для оплаченных счетов"
      />
      {serverError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {isEdit ? "Сохранить" : "Создать"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
