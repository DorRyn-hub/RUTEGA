import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  limit: number;
  total: number;
  hrefForPage: (page: number) => string;
}

export function Pagination({ page, limit, total, hrefForPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);
  const atStart = page <= 1;
  const atEnd = page >= pages;
  return (
    <nav
      aria-label="Пагинация"
      className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white px-4 py-3 text-sm"
    >
      <p className="text-[var(--color-muted)]">
        {total === 0 ? "Нет записей" : `${from}–${to} из ${total}`}
      </p>
      <div className="flex items-center gap-1">
        {atStart ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] px-3 text-[var(--color-muted)]">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Назад
          </span>
        ) : (
          <Link
            href={hrefForPage(prev)}
            className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-line)] px-3 hover:bg-[var(--color-bg)]"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Назад
          </Link>
        )}
        <span className="px-2 text-[var(--color-muted)]">
          стр. {page} / {pages}
        </span>
        {atEnd ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] px-3 text-[var(--color-muted)]">
            Вперёд
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={hrefForPage(next)}
            className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-line)] px-3 hover:bg-[var(--color-bg)]"
          >
            Вперёд
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
