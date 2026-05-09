import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { NewsCard } from "@/components/marketing/NewsCard";
import { getAllNews } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Новости и обновления Rutega",
  description: "Анонсы новых тарифов, технические работы, обновления сервисов и платформы Rutega.",
  alternates: { canonical: "/news" },
};

export const revalidate = 60;

export default async function NewsPage() {
  const items = await getAllNews();
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Новости" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Новости Rutega</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Запуски тарифов, технические работы, обновления оборудования и платформы.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
