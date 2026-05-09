import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { Check } from "lucide-react";
import { TariffTable } from "@/components/marketing/TariffTable";
import { LeadForm } from "@/components/marketing/LeadForm";
import { getAllServices, getServiceBySlug } from "@/lib/repos";
import { absoluteUrl } from "@/lib/siteUrl";

export const revalidate = 60;

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Услуга не найдена" };
  return {
    title: service.title,
    description: service.shortText,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.title} | Rutega`,
      description: service.shortText,
      url: `/services/${service.slug}`,
      type: "article",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Услуги", item: absoluteUrl("/services") },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: absoluteUrl(`/services/${service.slug}`),
      },
    ],
  };

  return (
    <>
      <Section tone="default">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Услуги", href: "/services" },
              { label: service.title },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                <Icon name={service.iconKey} className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{service.title}</h1>
              <p className="mt-3 text-lg text-[var(--color-muted)]">{service.shortText}</p>
              <div className="prose-rutega mt-8 max-w-none">
                {service.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {service.features.length > 0 ? (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div id="order" className="lg:col-span-5">
              <LeadForm
                source="tariff"
                title="Подключить услугу"
                description="Оставьте контакты, специалист уточнит адрес и подберёт тариф."
                submitLabel="Подключить"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">Тарифы «{service.title}»</h2>
          <TariffTable tariffs={service.tariffs} serviceSlug={service.slug} />
        </Container>
      </Section>
      <JsonLd data={breadcrumbsLd} />
    </>
  );
}
