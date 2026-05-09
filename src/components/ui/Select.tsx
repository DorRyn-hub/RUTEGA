import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  children: ReactNode;
}

const selectClass =
  "h-11 w-full appearance-none rounded-[var(--radius-md)] border bg-white bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat px-3.5 pr-10 text-base text-[var(--color-ink)] transition-colors focus:border-[var(--color-brand-600)] aria-[invalid=true]:border-[var(--color-danger)]";

const chevron =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%235b6273'><path d='M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.14-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-3.695 3.6-3.695 3.6a1.122 1.122 0 0 1-1.574 0S5.92 9.581 5.516 9.163c-.406-.418-.436-1.17 0-1.615z'/></svg>\")";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    label,
    error,
    hint,
    className,
    wrapperClassName,
    required,
    children,
    style,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const invalid = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
          {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
        </label>
      ) : null}
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : hint ? hintId : undefined}
        className={cn(selectClass, className)}
        style={{ backgroundImage: chevron, ...style }}
        {...rest}
      >
        {children}
      </select>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});
