import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { NewsCard } from "./NewsCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { HoverLift } from "@/components/motion/HoverLift";
import type { NewsItemDTO } from "@/types/domain";

export function NewsPreview({ items }: { items: NewsItemDTO[] }) {
  if (items.length === 0) return null;
  return (
    <Section tone="muted">
      <Container>
        <ScrollReveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
              Свежие новости
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Что нового в Rutega</h2>
          </div>
          <LinkButton href="/news" variant="secondary" size="md">
            Все новости
          </LinkButton>
        </ScrollReveal>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <HoverLift className="h-full">
                <NewsCard item={item} />
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
