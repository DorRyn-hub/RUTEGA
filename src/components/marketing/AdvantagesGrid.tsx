import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { advantages } from "@/data/advantages";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { HoverLift } from "@/components/motion/HoverLift";

export function AdvantagesGrid() {
  return (
    <Section tone="muted">
      <Container>
        <ScrollReveal className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
            Почему Rutega
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Инфраструктура и сервис, которым доверяют
          </h2>
        </ScrollReveal>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <StaggerItem key={a.title}>
              <HoverLift>
                <div className="flex h-full gap-4 rounded-[var(--radius-lg)] border bg-white p-5 transition-shadow hover:shadow-md">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                    <Icon name={a.iconKey} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{a.text}</p>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
