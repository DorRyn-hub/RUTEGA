import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  id: string;
  required?: boolean;
  children: (descId: string, errorId: string, invalid: boolean) => React.ReactNode;
}

function FieldShell({ label, error, hint, className, id, required, children }: FieldShellProps) {
  const descId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
          {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
        </label>
      ) : null}
      {children(descId, errorId, invalid)}
      {hint && !error ? (
        <p id={descId} className="text-xs text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-[var(--radius-md)] border bg-white px-3.5 text-base text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-colors focus:border-[var(--color-brand-600)] aria-[invalid=true]:border-[var(--color-danger)]";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, error, hint, className, wrapperClassName, required, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapperClassName}
    >
      {(descId, errorId, invalid) => (
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : hint ? descId : undefined}
          className={cn(inputClass, className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, error, hint, className, wrapperClassName, required, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapperClassName}
    >
      {(descId, errorId, invalid) => (
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : hint ? descId : undefined}
          className={cn(inputClass, "min-h-28 py-2.5 leading-relaxed", className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
});
