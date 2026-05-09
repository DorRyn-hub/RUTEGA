"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface UserInitial {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  phone: string | null;
  role: string;
  status?: string;
}

export function UserForm({ initial }: { initial: UserInitial }) {
  const router = useRouter();
  const [email, setEmail] = useState(initial.email);
  const [username, setUsername] = useState(initial.username ?? "");
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [role, setRole] = useState(initial.role);
  const [status, setStatus] = useState(initial.status ?? "active");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        email,
        username: username || null,
        fullName,
        phone: phone || null,
        role,
        status,
      };
      if (password) body.password = password;
      const res = await fetch(`/api/admin/users/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      router.replace("/admin/users");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Полное имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          required
        />
        <Input
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-ink)]">Роль</label>
          <select
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-ink)]">Статус</label>
          <select
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">активен</option>
            <option value="banned">заблокирован</option>
          </select>
        </div>
        <Input
          label="Новый пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Оставьте пустым, если не меняете"
          error={errors.password}
        />
      </div>
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
          Сохранить
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
