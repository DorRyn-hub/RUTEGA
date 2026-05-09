import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LeadForm } from "./LeadForm";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function CallbackSection() {
  return (
    <Section tone="default" id="callback">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-600)]">
              Связаться с нами
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Не нашли подходящий тариф? Подберём!
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Оставьте телефон, наш специалист свяжется с вами в течение 15 минут, проверит
              техническую возможность по адресу и предложит оптимальный пакет.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />
                <span>Без скрытых платежей и комиссий</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />
                <span>Подключение в день обращения, если есть техническая возможность</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 h-2 w-2 rounded-full bg-[var(--color-brand-600)]" />
                <span>Расторжение в любой момент без штрафов</span>
              </li>
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <LeadForm source="callback" />
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
