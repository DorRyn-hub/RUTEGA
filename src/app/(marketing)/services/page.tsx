import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAllServices } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Услуги — корпоративные сетевые решения Rutega",
  description:
    "Корпоративный интернет, IP-транзит, L2/L3 VPN, выделенные линии, Wi-Fi и сетевая безопасность. Исключительно для юридических лиц.",
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
            Корпоративные сетевые решения для юридических лиц: выделенные каналы, IP-транзит,
            VPN и безопасность — под единым SLA и в одном договоре.
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
