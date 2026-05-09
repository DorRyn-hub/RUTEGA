import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-[var(--color-muted)]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-[var(--color-brand-700)]">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-[var(--color-ink)]">
                  {item.label}
                </span>
              )}
              {!last ? (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
