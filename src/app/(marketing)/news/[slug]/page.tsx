import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { getAllNews, getNewsBySlug } from "@/lib/repos";
import { absoluteUrl } from "@/lib/siteUrl";

export const revalidate = 60;

export async function generateStaticParams() {
  const news = await getAllNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "Новость не найдена" };
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: {
      title: `${item.title} | Rutega`,
      description: item.excerpt,
      url: `/news/${item.slug}`,
      type: "article",
      publishedTime: item.publishedAt,
    },
  };
}

export default async function NewsItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: item.publishedAt,
    description: item.excerpt,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/news/${item.slug}`) },
    author: { "@type": "Organization", name: "Rutega" },
    publisher: { "@type": "Organization", name: "Rutega" },
  };

  return (
    <Section tone="default">
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Новости", href: "/news" },
            { label: item.title },
          ]}
        />
        <article className="mt-6">
          <time
            dateTime={item.publishedAt}
            className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]"
          >
            {formatDate(item.publishedAt)}
          </time>
          <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">{item.title}</h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">{item.excerpt}</p>
          <div className="prose-rutega mt-8">
            {item.body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-10 border-t pt-6">
            <LinkButton href="/news" variant="secondary">
              ← Все новости
            </LinkButton>
          </div>
        </article>
        <JsonLd data={articleLd} />
      </Container>
    </Section>
  );
}
