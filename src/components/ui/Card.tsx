import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  highlight?: boolean;
}

export function Card({ className, interactive, highlight, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm",
        interactive &&
          "transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        highlight && "border-[var(--color-brand-600)] ring-1 ring-[var(--color-brand-600)]",
        className,
      )}
      {...props}
    />
  );
}
