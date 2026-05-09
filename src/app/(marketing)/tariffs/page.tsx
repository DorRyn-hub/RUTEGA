import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TariffTable } from "@/components/marketing/TariffTable";
import { getAllServices } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Тарифы Rutega — все цены и пакеты",
  description:
    "Все тарифы Rutega: домашний интернет, ТВ, мобильная связь, бизнес-решения, видеонаблюдение, умный дом. Прозрачные цены без скрытых платежей.",
  alternates: { canonical: "/tariffs" },
};

export const revalidate = 60;

export default async function TariffsPage() {
  const services = await getAllServices();

  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Тарифы" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Тарифы</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Полный прайс-лист по всем услугам. Цены — за месяц обслуживания, без скрытых платежей и
            комиссий.
          </p>
        </div>

        <div className="mt-12 space-y-16">
          {services
            .filter((s) => s.tariffs.length > 0)
            .map((s) => (
              <div key={s.id} id={s.slug}>
                <h2 className="mb-6 text-2xl font-bold sm:text-3xl">{s.title}</h2>
                <TariffTable tariffs={s.tariffs} serviceSlug={s.slug} />
              </div>
            ))}
        </div>
      </Container>
    </Section>
  );
}
