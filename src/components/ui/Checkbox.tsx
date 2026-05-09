import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, error, hint, className, wrapperClassName, required, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const invalid = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--color-ink)]"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : hint ? hintId : undefined}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-brand-600)]",
            className,
          )}
          {...rest}
        />
        <span className="leading-snug">
          {label}
          {required ? (
            <span className="ml-1 text-[var(--color-danger)]">*</span>
          ) : null}
        </span>
      </label>
      {hint && !error ? (
        <p id={hintId} className="ml-7 text-xs text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="ml-7 text-xs font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});
