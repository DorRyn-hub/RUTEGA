import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function FormShell({ title, children }: Props) {
  return (
    <div className="admin-form rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
