import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LeadForm } from "@/components/marketing/LeadForm";
import { getServiceBySlug } from "@/lib/repos";
import { TariffTable } from "@/components/marketing/TariffTable";

export const metadata: Metadata = {
  title: "Решения для бизнеса — корпоративные подключения Rutega",
  description:
    "Выделенные каналы, видеонаблюдение, корпоративная мобильная связь и L2/L3 VPN. SLA 99.95% с финансовыми гарантиями. Подключим за 5–10 рабочих дней.",
  alternates: { canonical: "/business" },
};

export const revalidate = 60;

const cases = [
  {
    title: "Сети ритейла",
    text: "Подключение точек продаж в Москве и регионах. Резервирование канала и приоритезация POS-трафика.",
    iconKey: "server",
  },
  {
    title: "Бизнес-центры",
    text: "Оптика до этажа, выделенный VLAN на каждого арендатора, биллинг под брендом владельца.",
    iconKey: "building-2",
  },
  {
    title: "Государственные структуры",
    text: "Защищённые каналы по 152-ФЗ, шифрование, аттестация рабочих мест.",
    iconKey: "shield-check",
  },
  {
    title: "Финансовый сектор",
    text: "Двойное резервирование, физически независимые маршруты, KPI по доступности в договоре.",
    iconKey: "receipt",
  },
];

export default async function BusinessPage() {
  const business = await getServiceBySlug("business-internet");

  return (
    <>
      <Section tone="brand">
        <Container>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Бизнесу" }]} />
          <div className="mt-4 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="text-4xl font-bold sm:text-5xl">
                Корпоративные решения с SLA 99.95%
              </h1>
              <p className="mt-3 text-lg text-[var(--color-muted)]">
                Выделенные каналы, видеонаблюдение и облачные сервисы для офисов, ритейла и
                бизнес-центров. Персональный менеджер на этапе подключения и в эксплуатации.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="#order" size="lg">
                  Запросить КП
                </LinkButton>
                <LinkButton href="/services/business-internet" size="lg" variant="secondary">
                  Тарифы для бизнеса
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="default">
        <Container>
          <h2 className="text-3xl font-bold sm:text-4xl">Отрасли, с которыми работаем</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {cases.map((c) => (
              <li key={c.title}>
                <Card className="flex h-full gap-4">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                    <Icon name={c.iconKey} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{c.text}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {business ? (
        <Section tone="muted">
          <Container>
            <h2 className="text-3xl font-bold sm:text-4xl">Тарифы Rutega Business</h2>
            <div className="mt-8">
              <TariffTable tariffs={business.tariffs} serviceSlug={business.slug} />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="default">
        <Container className="grid items-start gap-10 lg:grid-cols-2" id="order">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Запросите коммерческое предложение</h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Подготовим индивидуальное предложение в течение 1 рабочего дня. Учтём адресный план,
              требования к SLA, регламенты безопасности.
            </p>
          </div>
          <LeadForm
            source="contact"
            title="Запросить КП"
            description="Менеджер свяжется в течение часа в рабочее время."
            submitLabel="Получить КП"
          />
        </Container>
      </Section>
    </>
  );
}
