import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { HeroBanner } from "@/components/marketing/HeroBanner";
import { ServicesPreview } from "@/components/marketing/ServicesPreview";
import { AdvantagesGrid } from "@/components/marketing/AdvantagesGrid";
import { TariffTable } from "@/components/marketing/TariffTable";
import { PromoBlock } from "@/components/marketing/PromoBlock";
import { NewsPreview } from "@/components/marketing/NewsPreview";
import { CallbackSection } from "@/components/marketing/CallbackSection";
import { getAllServices, getAllNews, getHighlightedTariffs } from "@/lib/repos";

export const revalidate = 60;

export default async function HomePage() {
  const [services, tariffs, news] = await Promise.all([
    getAllServices(),
    getHighlightedTariffs(3),
    getAllNews(),
  ]);

  return (
    <>
      <HeroBanner />
      <ServicesPreview services={services.slice(0, 6)} />
      <AdvantagesGrid />

      <Section tone="default">
        <Container>
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
              Хиты весны
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Популярные тарифы</h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Уже выбраны нашими клиентами тысячи раз. Подключение — за 1–3 рабочих дня.
            </p>
          </div>
          <TariffTable tariffs={tariffs} />
        </Container>
      </Section>

      <PromoBlock />
      <NewsPreview items={news.slice(0, 3)} />
      <CallbackSection />
    </>
  );
}
