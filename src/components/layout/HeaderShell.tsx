"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[box-shadow,background-color,border-color] duration-200",
        scrolled
          ? "border-[var(--color-line)] bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75"
          : "border-transparent bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
      )}
    >
      {children}
    </header>
  );
}
