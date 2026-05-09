import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CaseDTO } from "@/types/domain";

export function CaseCard({ data, className }: { data: CaseDTO; className?: string }) {
  return (
    <Link
      href={`/cases/${data.slug}`}
      aria-label={`Кейс: ${data.clientName}`}
      className={cn(
        "group flex h-full flex-col rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-brand-300)] hover:shadow-md sm:p-7",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-700)]">
          {data.industry}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            data.segment === "b2g"
              ? "bg-amber-50 text-amber-800"
              : "bg-emerald-50 text-emerald-800",
          )}
        >
          {data.segment === "b2g" ? "B2G" : "B2B"}
        </span>
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-ink)]">
        {data.clientName}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{data.summary}</p>

      {data.metrics.length > 0 ? (
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          {data.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <dt className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
                {m.label}
              </dt>
              <dd className="mt-0.5 font-display text-base font-semibold text-[var(--color-ink)]">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-auto pt-4 text-sm font-medium text-[var(--color-brand-700)] group-hover:text-[var(--color-brand-800)]">
        Читать кейс →
      </div>
    </Link>
  );
}
