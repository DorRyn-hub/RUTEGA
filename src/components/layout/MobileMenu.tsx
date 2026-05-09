"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, LogIn } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  items: NavItem[];
  authenticated: boolean;
}

export function MobileMenu({ items, authenticated }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <div className="lg:hidden">
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Главное меню"
              className="fixed inset-x-0 top-0 z-[80] flex max-h-[100dvh] flex-col bg-white shadow-xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-4">
                <span className="font-display text-lg font-bold">Меню</span>
                <button
                  type="button"
                  aria-label="Закрыть меню"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-bg)]"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto p-4">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-[var(--radius-md)] px-3 py-3 text-lg font-medium hover:bg-[var(--color-bg)]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={authenticated ? "/lk" : "/lk/login"}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-4 py-3 font-semibold text-white"
                >
                  <LogIn aria-hidden="true" className="h-5 w-5" />
                  {authenticated ? "Личный кабинет" : "Войти в ЛК"}
                </Link>
              </nav>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--color-bg)] lg:hidden"
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {panel}
    </>
  );
}
