"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface DialogHandle {
  open: () => void;
  close: () => void;
}

interface DialogProps {
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Лёгкая модалка на базе нативного <dialog> — focus-trap и ESC из коробки.
 * Управляется либо через ref (imperative), либо через open prop (controlled).
 */
export const Dialog = forwardRef<DialogHandle, DialogProps>(function Dialog(
  { title, description, open, onOpenChange, children, className },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const showDialog = useCallback(() => {
    const node = dialogRef.current;
    if (node && !node.open) node.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    const node = dialogRef.current;
    if (node && node.open) node.close();
  }, []);

  useImperativeHandle(
    ref,
    () => ({ open: showDialog, close: closeDialog }),
    [showDialog, closeDialog],
  );

  useEffect(() => {
    if (open === undefined) return;
    if (open) showDialog();
    else closeDialog();
  }, [open, showDialog, closeDialog]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const handler = () => onOpenChange?.(false);
    node.addEventListener("close", handler);
    return () => node.removeEventListener("close", handler);
  }, [onOpenChange]);

  // Закрытие по клику на backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeDialog();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className={cn(
        "m-auto rounded-[var(--radius-lg)] border-0 bg-white p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-fade-in-up",
        "max-w-[calc(100vw-2rem)] sm:max-w-md",
        className,
      )}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="dialog-title"
              className="font-display text-xl font-semibold text-[var(--color-ink)]"
            >
              {title}
            </h2>
            {description ? (
              <p
                id="dialog-description"
                className="mt-1 text-sm text-[var(--color-muted)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Закрыть"
            className="-m-2 rounded-md p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
});
