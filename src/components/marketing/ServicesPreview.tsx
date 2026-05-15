import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "./ServiceCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { HoverLift } from "@/components/motion/HoverLift";
import type { ServiceDTO } from "@/types/domain";

export function ServicesPreview({ services }: { services: ServiceDTO[] }) {
  return (
    <Section tone="default">
      <Container>
        <ScrollReveal className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
            Услуги
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Корпоративные сетевые решения
          </h2>
          <p className="mt-3 text-[var(--color-muted)]">
            Выделенные каналы, IP-транзит, VPN и безопасность — всё под единым SLA и в одном
            договоре для вашей организации.
          </p>
        </ScrollReveal>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.id} className="h-full">
              <HoverLift className="h-full">
                <ServiceCard service={s} />
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
