import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Контакты Rutega — телефоны, адрес офиса, обратная связь",
  description:
    "Адрес офиса, телефоны для частных и корпоративных клиентов, e-mail, форма обратной связи.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  const mapEmbed = process.env.NEXT_PUBLIC_YANDEX_MAP_EMBED;
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Контакты</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Свяжитесь с нами удобным способом — мы ответим круглосуточно.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[var(--radius-lg)] border bg-white p-6">
              <h2 className="text-lg font-semibold">Телефоны</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 text-[var(--color-brand-600)]" />
                  <div>
                    <a
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                      className="text-base font-semibold"
                    >
                      {company.phone}
                    </a>
                    <p className="text-[var(--color-muted)]">Частным клиентам</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 text-[var(--color-brand-600)]" />
                  <div>
                    <a
                      href={`tel:${company.phoneB2B.replace(/\s/g, "")}`}
                      className="text-base font-semibold"
                    >
                      {company.phoneB2B}
                    </a>
                    <p className="text-[var(--color-muted)]">Корпоративным клиентам</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-lg)] border bg-white p-6">
              <h2 className="text-lg font-semibold">E-mail</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 text-[var(--color-brand-600)]" />
                  <div>
                    <a href={`mailto:${company.email}`} className="text-base font-semibold">
                      {company.email}
                    </a>
                    <p className="text-[var(--color-muted)]">Общие вопросы</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 text-[var(--color-brand-600)]" />
                  <div>
                    <a
                      href={`mailto:${company.emailSupport}`}
                      className="text-base font-semibold"
                    >
                      {company.emailSupport}
                    </a>
                    <p className="text-[var(--color-muted)]">Техподдержка</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-lg)] border bg-white p-6">
              <h2 className="text-lg font-semibold">Офис</h2>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-600)]"
                />
                {company.address}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm text-[var(--color-muted)]">
                <Clock
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-600)]"
                />
                {company.workingHours}
              </p>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-bg)]">
              {mapEmbed ? (
                <iframe
                  src={mapEmbed}
                  width="100%"
                  height="320"
                  frameBorder={0}
                  allowFullScreen
                  loading="lazy"
                  title="Карта офиса Rutega"
                />
              ) : (
                <div className="flex h-64 items-center justify-center p-6 text-center text-sm text-[var(--color-muted)]">
                  Карта появится после установки переменной NEXT_PUBLIC_YANDEX_MAP_EMBED.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
