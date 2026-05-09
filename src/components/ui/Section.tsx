import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: "default" | "muted" | "brand";
}

export function Section({ className, tone = "default", ...props }: SectionProps) {
  const toneClass =
    tone === "muted"
      ? "bg-[var(--color-bg)]"
      : tone === "brand"
        ? "bg-[var(--color-brand-50)]"
        : "bg-[var(--color-surface)]";
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20", toneClass, className)} {...props} />
  );
}
