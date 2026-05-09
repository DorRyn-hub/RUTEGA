"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NavList } from "./Sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink)] hover:bg-[var(--color-bg)] lg:hidden"
      >
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Меню админки"
        >
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[82vw] max-w-[320px] flex-col border-r border-[var(--color-line)] bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-line)] px-4">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="font-display text-lg font-bold text-[var(--color-ink)]"
              >
                Rutega · Admin
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="border-t border-[var(--color-line)] p-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
              >
                ← На сайт
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
