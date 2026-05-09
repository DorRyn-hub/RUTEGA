import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "success" | "warn" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "bg-[var(--color-bg)] text-[var(--color-muted)]",
  brand: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
  success: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
