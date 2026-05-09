import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight",
        className,
      )}
      aria-label="Rutega — на главную"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] text-white shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M7.5 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </span>
      <span>Rutega</span>
    </Link>
  );
}
