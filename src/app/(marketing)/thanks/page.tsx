import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Спасибо за заявку — Rutega",
  description: "Мы получили вашу заявку и свяжемся в ближайшее время.",
  alternates: { canonical: "/thanks" },
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <Section tone="default">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5l4 4 10-10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Спасибо!</h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">
            Мы получили вашу заявку. Менеджер свяжется в течение 15 минут в рабочее
            время. В нерабочее — в начале следующего рабочего дня.
          </p>

          <div className="mt-8 grid gap-4 rounded-[var(--radius-lg)] border bg-white p-6 text-left shadow-sm sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Если срочно — позвоните
              </div>
              <a
                href={`tel:${company.phoneB2B.replace(/[\s()-]/g, "")}`}
                className="mt-1 block font-display text-xl font-semibold text-[var(--color-brand-700)]"
              >
                {company.phoneB2B}
              </a>
              <div className="mt-1 text-xs text-[var(--color-muted)]">
                Линия для B2B/B2G клиентов
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Или напишите
              </div>
              <a
                href={`mailto:${company.email}`}
                className="mt-1 block font-display text-xl font-semibold text-[var(--color-brand-700)]"
              >
                {company.email}
              </a>
              <div className="mt-1 text-xs text-[var(--color-muted)]">
                {company.workingHours}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cases"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border bg-white px-5 font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-brand-300)]"
            >
              Посмотреть кейсы
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-5 font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-700)]"
            >
              На главную
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
