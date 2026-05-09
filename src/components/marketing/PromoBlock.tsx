import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function PromoBlock() {
  return (
    <Section tone="default">
      <Container>
        <ScrollReveal>
          <div
            className="animate-gradient-shift relative overflow-hidden rounded-[var(--radius-xl)] p-8 text-white shadow-xl sm:p-12"
            style={{
              backgroundImage:
                "linear-gradient(120deg, var(--color-brand-700) 0%, var(--color-brand-500) 50%, var(--color-brand-800) 100%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative grid items-center gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
                  Конвергентный пакет
                </p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Интернет + ТВ + мобильная связь — со скидкой 35%
                </h2>
                <p className="mt-3 max-w-2xl opacity-90">
                  Объедините услуги в один договор и счёт. Один менеджер, одна поддержка, одна
                  выгода — каждый месяц.
                </p>
              </div>
              <div className="flex justify-start lg:col-span-4 lg:justify-end">
                <LinkButton href="/tariffs" variant="secondary" size="lg" className="bg-white">
                  Собрать пакет
                </LinkButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
