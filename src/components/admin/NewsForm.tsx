"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface NewsInitial {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  publishedAt?: string;
  cover?: string | null;
}

function toDateInput(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export function NewsForm({ initial }: { initial?: NewsInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [publishedAt, setPublishedAt] = useState(toDateInput(initial?.publishedAt));
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/news/${initial!.id}` : "/api/admin/news";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          excerpt,
          body,
          publishedAt: new Date(publishedAt).toISOString(),
          cover: cover || null,
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
      router.replace("/admin/news");
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
          label="Дата публикации"
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          error={errors.publishedAt}
          required
        />
      </div>
      <Input
        label="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <Input
        label="Краткое описание"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        error={errors.excerpt}
        required
      />
      <Textarea
        label="Текст новости (поддерживается markdown в исходном виде)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-60"
        error={errors.body}
        required
      />
      <Input
        label="Обложка (URL)"
        value={cover}
        onChange={(e) => setCover(e.target.value)}
        error={errors.cover}
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
          {isEdit ? "Сохранить" : "Опубликовать"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
