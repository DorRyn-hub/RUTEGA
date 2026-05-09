"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "./MobileNav";

interface Props {
  user: { fullName: string; username: string | null; email: string };
}

export function TopBar({ user }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--color-line)] bg-white px-3 lg:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link
          href="/admin"
          className="font-display text-base font-bold text-[var(--color-ink)] lg:hidden"
        >
          Rutega · Admin
        </Link>
        <Link
          href="/"
          className="hidden text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] lg:inline-block"
        >
          ← На сайт
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{user.fullName}</p>
          <p className="text-xs text-[var(--color-muted)]">@{user.username ?? user.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Выйти
        </Button>
      </div>
    </header>
  );
}
