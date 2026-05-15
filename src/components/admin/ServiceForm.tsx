"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StringListInput } from "./StringListInput";

interface ServiceInitial {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  shortText?: string;
  description?: string;
  iconKey?: string;
  features?: string[];
  order?: number;
}

const CATEGORIES = ["internet", "transit", "vpn", "dedicated", "wifi", "security"];

export function ServiceForm({ initial }: { initial?: ServiceInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "internet");
  const [shortText, setShortText] = useState(initial?.shortText ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [iconKey, setIconKey] = useState(initial?.iconKey ?? "globe");
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/services/${initial!.id}`
        : "/api/admin/services";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          category,
          shortText,
          description,
          iconKey,
          features,
          order: Number(order) || 0,
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
      router.replace("/admin/services");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
          required
        />
        <Input
          label="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-ink)]">Категория</label>
          <select
            className="h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-base"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Иконка (iconKey)"
          value={iconKey}
          onChange={(e) => setIconKey(e.target.value)}
          error={errors.iconKey}
          hint="Ключ иконки из @/components/ui/Icon"
        />
        <Input
          label="Порядок"
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          error={errors.order}
        />
      </div>
      <Input
        label="Короткое описание"
        value={shortText}
        onChange={(e) => setShortText(e.target.value)}
        error={errors.shortText}
        required
      />
      <Textarea
        label="Полное описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        required
      />
      <StringListInput
        label="Ключевые особенности"
        value={features}
        onChange={setFeatures}
        placeholder="Например: до 1 Гбит/с"
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
