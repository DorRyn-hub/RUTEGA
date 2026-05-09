import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] active:translate-y-[1px] shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-[var(--color-brand-700)] border border-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]",
  ghost: "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-bg)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;
type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", fullWidth, loading, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  href,
  children,
  ...rest
}: LinkButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  const cls = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  if (isExternal) {
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}
