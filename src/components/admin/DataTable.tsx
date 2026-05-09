import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortKey?: string;
  /** На мобиле: "primary" — заголовок карточки, "actions" — нижний ряд кнопок, "hidden" — скрыть */
  mobile?: "primary" | "actions" | "hidden";
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  rowKey: (row: T) => string;
  sort?: string;
  sortHref?: (next: string) => string;
}

function nextSort(current: string | undefined, target: string): string {
  const [field, dir] = (current ?? "").split(".");
  if (field === target) return `${target}.${dir === "asc" ? "desc" : "asc"}`;
  return `${target}.asc`;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown aria-hidden="true" className="h-3 w-3 opacity-50" />;
  return dir === "asc" ? (
    <ArrowUp aria-hidden="true" className="h-3 w-3" />
  ) : (
    <ArrowDown aria-hidden="true" className="h-3 w-3" />
  );
}

export function DataTable<T>({ rows, columns, empty, rowKey, sort, sortHref }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] bg-white p-10 text-center text-sm text-[var(--color-muted)]">
        {empty ?? "Нет записей"}
      </div>
    );
  }
  const [activeField, activeDir] = (sort ?? "").split(".") as [string, "asc" | "desc"];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white">
      {/* Desktop / tablet view */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-line)] bg-[var(--color-bg)] text-left">
            <tr>
              {columns.map((col) => {
                const sortable = col.sortKey && sortHref;
                const isActive = sortable && col.sortKey === activeField;
                const headCls = cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]",
                  col.className,
                );
                if (!sortable) {
                  return (
                    <th key={col.key} className={headCls}>
                      {col.header}
                    </th>
                  );
                }
                return (
                  <th key={col.key} className={headCls}>
                    <Link
                      href={sortHref!(nextSort(sort, col.sortKey!))}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-[var(--color-ink)]",
                        isActive && "text-[var(--color-ink)]",
                      )}
                    >
                      {col.header}
                      <SortIcon active={!!isActive} dir={activeDir ?? "asc"} />
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-bg)]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 align-middle text-[var(--color-ink)]", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-[var(--color-line)] sm:hidden">
        {rows.map((row) => {
          // Эвристики, чтобы существующие страницы работали без правок:
          //  - первая колонка → заголовок карточки;
          //  - колонка key="actions" → блок действий внизу;
          //  - mobile="hidden" → пропускается;
          //  - остальные → label/value.
          const primary = columns.find((c) => c.mobile === "primary") ?? columns[0];
          const actions =
            columns.find((c) => c.mobile === "actions") ??
            columns.find((c) => c.key === "actions");
          const fields = columns.filter(
            (c) => c !== primary && c !== actions && c.mobile !== "hidden",
          );
          return (
            <li key={rowKey(row)} className="space-y-2 p-4 text-sm">
              {primary && (
                <div className="text-base font-semibold text-[var(--color-ink)]">
                  {primary.render(row)}
                </div>
              )}
              {fields.length > 0 && (
                <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5">
                  {fields.map((col) => (
                    <div key={col.key} className="contents">
                      <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                        {col.header}
                      </dt>
                      <dd className="min-w-0 break-words text-right text-[var(--color-ink)]">
                        {col.render(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {actions && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  {actions.render(row)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
