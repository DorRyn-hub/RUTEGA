import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { faq } from "@/data/faq";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Поддержка и часто задаваемые вопросы — Rutega",
  description: "Круглосуточная техподдержка, FAQ, контакты для физических лиц и бизнеса.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <Section tone="default">
      <Container className="max-w-5xl">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поддержка" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Поддержка</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Круглосуточно и без выходных. Живые инженеры, без ботов и перевода между отделами.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="flex flex-col gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <Phone aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">Телефон</h2>
            <a
              href={`tel:${company.phone.replace(/[\s()-]/g, "")}`}
              className="text-lg font-semibold text-[var(--color-brand-700)]"
            >
              {company.phone}
            </a>
            <p className="text-sm text-[var(--color-muted)]">Бесплатно по России</p>
          </Card>
          <Card className="flex flex-col gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <Mail aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">E-mail</h2>
            <a
              href={`mailto:${company.emailSupport}`}
              className="text-lg font-semibold text-[var(--color-brand-700)]"
            >
              {company.emailSupport}
            </a>
            <p className="text-sm text-[var(--color-muted)]">Ответ в течение 1 часа</p>
          </Card>
          <Card className="flex flex-col gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">Чат и Telegram</h2>
            <p className="text-lg font-semibold text-[var(--color-brand-700)]">@rutega_help</p>
            <p className="text-sm text-[var(--color-muted)]">Среднее время ответа — 30 секунд</p>
          </Card>
        </div>

        <div className="mt-14">
          <h2 className="text-3xl font-bold sm:text-4xl">Частые вопросы</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Самые популярные вопросы наших клиентов. Не нашли свой?{" "}
            <a className="font-semibold text-[var(--color-brand-700)] underline" href="/contacts">
              Напишите нам
            </a>
            .
          </p>
          <div className="mt-6">
            <Accordion items={faq} />
          </div>
        </div>

        <div className="mt-14 rounded-[var(--radius-lg)] border bg-[var(--color-brand-50)] p-8 text-center">
          <h2 className="text-2xl font-bold">Остались вопросы?</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            В Личном кабинете можно открыть тикет, посмотреть историю обращений и оформить
            обратный визит инженера.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <LinkButton href="/lk">Перейти в Личный кабинет</LinkButton>
            <LinkButton href="/contacts" variant="secondary">
              Написать нам
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
