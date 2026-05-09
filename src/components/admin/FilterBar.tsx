import Link from "next/link";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SelectOpt {
  value: string;
  label: string;
}

interface FilterField {
  name: string;
  placeholder?: string;
  defaultValue?: string;
  kind: "text";
}

interface FilterSelect {
  name: string;
  label: string;
  defaultValue?: string;
  options: SelectOpt[];
  kind: "select";
}

export type FilterControl = FilterField | FilterSelect;

interface Props {
  action: string;
  q?: string;
  controls?: FilterControl[];
  resetHref?: string;
  exportHref?: string;
}

export function FilterBar({ action, q, controls = [], resetHref, exportHref }: Props) {
  return (
    <form
      action={action}
      method="get"
      className="admin-form flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-3"
    >
      <label className="flex w-full min-w-0 flex-1 flex-col gap-1 sm:min-w-[260px]">
        <span className="text-xs font-medium text-[var(--color-muted)]">Поиск</span>
        <span className="relative inline-flex items-center">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--color-muted)]"
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Имя, email, телефон, логин"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white pl-9 pr-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none sm:h-10"
          />
        </span>
      </label>

      {controls.map((c) => {
        if (c.kind === "select") {
          return (
            <label key={c.name} className="flex w-full min-w-0 flex-col gap-1 sm:w-auto">
              <span className="text-xs font-medium text-[var(--color-muted)]">{c.label}</span>
              <select
                name={c.name}
                defaultValue={c.defaultValue ?? ""}
                className="h-11 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-3 text-sm focus:border-[var(--color-brand-600)] focus:outline-none sm:h-10"
              >
                {c.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <label key={c.name} className="flex w-full min-w-0 flex-col gap-1 sm:w-auto">
            <span className="text-xs font-medium text-[var(--color-muted)]">
              {c.placeholder ?? c.name}
            </span>
            <input
              type="text"
              name={c.name}
              defaultValue={c.defaultValue ?? ""}
              placeholder={c.placeholder}
              className="h-11 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-3 text-sm sm:h-10"
            />
          </label>
        );
      })}

      <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-end">
        <Button type="submit" size="md" variant="primary" className="flex-1 sm:flex-none">
          Применить
        </Button>
        {resetHref ? (
          <Link
            href={resetHref}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)] sm:flex-none"
          >
            Сбросить
          </Link>
        ) : null}
        {exportHref ? (
          <Link
            href={exportHref}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] px-4 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-bg)] sm:flex-none"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Excel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
