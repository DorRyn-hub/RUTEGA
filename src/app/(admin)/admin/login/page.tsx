import type { Metadata } from "next";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Вход в админ-панель",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-50)] via-white to-[var(--color-bg)] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[var(--color-brand-200)] opacity-50 blur-3xl"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white/95 p-8 shadow-xl backdrop-blur">
        <span className="inline-block rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-700)]">
          ADMIN
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)]">
          Вход в панель управления
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Используйте логин администратора и пароль.
        </p>
        <AdminLoginForm from={from ?? "/admin"} />
      </div>
    </main>
  );
}
