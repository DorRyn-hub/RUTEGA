import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Команда — Rutega",
  description:
    "Команда Rutega: сетевые инженеры, специалисты NOC, менеджеры. Опыт в B2B/B2G-провайдинге.",
  alternates: { canonical: "/about/team" },
};

const TEAM = [
  {
    name: "Карим Рындин",
    role: "Генеральный директор",
    bio: "Развивает Rutega с момента основания. Отвечает за стратегию, B2G-направление, ключевые контракты.",
  },
  {
    name: "Технический директор",
    role: "CTO",
    bio: "Архитектор опорной сети, отвечает за надёжность и развитие инфраструктуры. 15+ лет в магистральном провайдинге.",
  },
  {
    name: "Руководитель NOC",
    role: "Network Operations Center",
    bio: "Команда инженеров 24/7. Мониторинг, реагирование на инциденты, плановые работы. Среднее время ответа на тикет — 12 минут.",
  },
  {
    name: "Команда B2G",
    role: "Госзаказы и тендеры",
    bio: "Юристы и менеджеры с профильным опытом по 44-ФЗ и 223-ФЗ. Готовят документы и сопровождают исполнение.",
  },
];

export default function TeamPage() {
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "О компании" },
            { label: "Команда" },
          ]}
        />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Команда</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Мы строим то, что эксплуатируем. Команда инженеров и менеджеров с опытом
            работы в B2B/B2G-провайдинге.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {TEAM.map((m) => (
            <article
              key={m.name}
              className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm"
            >
              <div className="font-display text-xl font-semibold text-[var(--color-ink)]">
                {m.name}
              </div>
              <div className="mt-1 text-sm font-medium text-[var(--color-brand-700)]">
                {m.role}
              </div>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{m.bio}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
