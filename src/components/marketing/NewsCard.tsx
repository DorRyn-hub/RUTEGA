import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { NewsItemDTO } from "@/types/domain";

export function NewsCard({ item }: { item: NewsItemDTO }) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--radius-lg)] border bg-white p-6 transition-shadow hover:shadow-md">
      <time
        dateTime={item.publishedAt}
        className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-600)]"
      >
        {formatDate(item.publishedAt)}
      </time>
      <h3 className="mt-2 text-lg font-semibold leading-snug">
        <Link
          href={`/news/${item.slug}`}
          className="hover:underline focus:outline-none"
        >
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm text-[var(--color-muted)]">{item.excerpt}</p>
      <Link
        href={`/news/${item.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-700)] transition-transform group-hover:translate-x-0.5"
      >
        Читать
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}
