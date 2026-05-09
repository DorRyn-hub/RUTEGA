import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CaseCard } from "@/components/marketing/CaseCard";
import { getAllCases } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Кейсы — Rutega",
  description:
    "Реальные проекты Rutega: подключение торговых сетей, девелоперов, госучреждений. Инфраструктура, метрики, результат.",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "Кейсы Rutega",
    description: "Истории клиентов: оптика, радиоканалы, L2/L3-VPN для бизнеса и госсектора.",
    url: "/cases",
    type: "website",
  },
};

export const revalidate = 300;

export default async function CasesPage() {
  const cases = await getAllCases();
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Кейсы" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Кейсы</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Реальные проекты — что было, что сделали, что получилось. Имена клиентов
            публикуем по согласованию.
          </p>
        </div>

        {cases.length === 0 ? (
          <p className="mt-10 text-[var(--color-muted)]">Кейсы скоро появятся.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <CaseCard key={c.id} data={c} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
