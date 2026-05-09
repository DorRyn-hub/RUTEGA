import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { LeadForm } from "@/components/marketing/LeadForm";
import { getAllCases, getCaseBySlug } from "@/lib/repos";
import { absoluteUrl } from "@/lib/siteUrl";

export const revalidate = 300;

export async function generateStaticParams() {
  const cases = await getAllCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) return { title: "Кейс не найден" };
  return {
    title: `${c.clientName} — кейс Rutega`,
    description: c.summary,
    alternates: { canonical: `/cases/${c.slug}` },
    openGraph: {
      title: `${c.clientName} — кейс Rutega`,
      description: c.summary,
      url: `/cases/${c.slug}`,
      type: "article",
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) notFound();

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Кейсы", item: absoluteUrl("/cases") },
      {
        "@type": "ListItem",
        position: 3,
        name: c.clientName,
        item: absoluteUrl(`/cases/${c.slug}`),
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Кейс Rutega: ${c.clientName}`,
    datePublished: c.publishedAt,
    description: c.summary,
    publisher: {
      "@type": "Organization",
      name: "Rutega",
    },
    about: { "@type": "Thing", name: c.industry },
  };

  return (
    <>
      <Section tone="default">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Кейсы", href: "/cases" },
              { label: c.clientName },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-700)]">
                  {c.industry}
                </span>
                <span
                  className={
                    c.segment === "b2g"
                      ? "inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                      : "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                  }
                >
                  {c.segment === "b2g" ? "B2G" : "B2B"}
                </span>
              </div>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{c.clientName}</h1>
              <p className="mt-3 text-lg text-[var(--color-muted)]">{c.summary}</p>

              {c.metrics.length > 0 ? (
                <dl className="mt-8 grid gap-4 rounded-[var(--radius-lg)] border bg-white p-5 sm:grid-cols-3">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                        {m.label}
                      </dt>
                      <dd className="mt-1 font-display text-2xl font-bold text-[var(--color-brand-800)]">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="prose-rutega mt-8 max-w-none">
                <h2>Задача</h2>
                <p>{c.challenge}</p>
                <h2>Решение</h2>
                <p>{c.solution}</p>
                <h2>Результат</h2>
                <p>{c.result}</p>
              </div>

              {c.techStack.length > 0 ? (
                <div className="mt-8">
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Технологии
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {c.techStack.map((t) => (
                      <li
                        key={t}
                        className="inline-flex items-center rounded-md border px-2.5 py-1 text-sm text-[var(--color-ink)]"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-4">
              <LeadForm
                source="contact"
                title="Хотите так же?"
                description="Расскажите о проекте — пришлём похожий референс и расчёт."
                submitLabel="Получить расчёт"
                variant="two-step"
                redirectToThanks
              />
            </div>
          </div>
        </Container>
      </Section>
      <JsonLd data={[breadcrumbsLd, articleLd]} />
    </>
  );
}
