import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAllServices } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Услуги — каталог сервисов Rutega",
  description:
    "Каталог услуг Rutega: домашний интернет, цифровое ТВ, мобильная связь, решения для бизнеса, видеонаблюдение и умный дом.",
  alternates: { canonical: "/services" },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getAllServices();
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Услуги Rutega</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Полный каталог сервисов: для дома, бизнеса и комфорта. Подключайте отдельно или
            объединяйте в один договор со скидкой.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
