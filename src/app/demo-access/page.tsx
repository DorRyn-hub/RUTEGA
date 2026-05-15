import type { Metadata } from "next";
import { DemoAccessForm } from "./DemoAccessForm";

export const metadata: Metadata = {
  title: "Демо-доступ — Rutega",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function DemoAccessPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-50)] via-white to-[var(--color-bg)] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[var(--color-brand-200)] opacity-50 blur-3xl animate-[slow-pulse_8s_ease-in-out_infinite]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-[var(--color-brand-300)] opacity-40 blur-3xl animate-[slow-pulse_10s_ease-in-out_infinite_2s]"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/90 p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">
            Закрытый предпросмотр Rutega
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Введите выданные логин и пароль, чтобы открыть демо-сайт.
          </p>
        </div>
        <DemoAccessForm from={from ?? "/"} />
      </div>
    </main>
  );
}
