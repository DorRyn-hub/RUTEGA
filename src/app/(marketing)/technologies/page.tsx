import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Технологии и инфраструктура Rutega",
  description:
    "Опорная сеть Rutega: оптика, радиоканалы PtP/PtMP, ЦОД, BGP-аплинки, защита от DDoS. Собственная инфраструктура в Москве и Подмосковье.",
  alternates: { canonical: "/technologies" },
};

const PILLARS = [
  {
    iconKey: "network",
    title: "Опорная сеть",
    text: "Магистраль 100/400G в кольцевой топологии с автоматическим переключением на резерв за 50 мс. Пиринг с ключевыми операторами и магистральными провайдерами.",
  },
  {
    iconKey: "wifi",
    title: "Оптика «последней мили»",
    text: "FTTB/FTTH до квартиры или офиса. Активное и пассивное оборудование российских и азиатских вендоров. Запас по полосе минимум 3× от проектной нагрузки.",
  },
  {
    iconKey: "radio",
    title: "Радиоканалы",
    text: "PtP до 10 Гбит/с в лицензированном диапазоне; PtMP для распределённых объектов. Каналы Wi-Fi 6E и 5 ГГц с резервированием по частоте и направлению.",
  },
  {
    iconKey: "shield",
    title: "Защита и SLA",
    text: "Многоуровневая защита от DDoS на стыке с провайдерами и на ядре. SLA 99.5–99.95% с финансовыми компенсациями. Мониторинг 24/7 на собственном NOC.",
  },
  {
    iconKey: "server",
    title: "ЦОД и colocation",
    text: "Размещение оборудования в стойках Tier-III ЦОД на территории РФ. Резервированные питание и охлаждение, СКС и кабинеты под ключ.",
  },
  {
    iconKey: "lock",
    title: "Безопасность канала",
    text: "Поддержка ГОСТ-шифрования на стыке для B2G-заказчиков. L2/L3-VPN, изоляция трафика клиентов, сегментация по VLAN/MPLS.",
  },
];

export default function TechnologiesPage() {
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Технологии" }]}
        />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Технологии и инфраструктура
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Собственная сеть Rutega: оптика, радиоканалы, ЦОД и команда NOC. Мы строим то,
            что эксплуатируем — поэтому отвечаем за SLA финансово.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <article
              key={p.title}
              className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-sm"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
                <Icon name={p.iconKey} className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{p.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--radius-xl)] border bg-[var(--color-brand-50)] p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Для тендеров и приёмки
          </h2>
          <p className="mt-2 max-w-3xl text-[var(--color-ink)]">
            Готовы предоставить пакет документов для участия в тендерах 44-ФЗ / 223-ФЗ:
            лицензии связи, выписки из реестра операторов, сертификаты на оборудование,
            подтверждение размещения данных в РФ.
          </p>
          <a
            href="/about/licenses"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-600)] px-5 font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-700)]"
          >
            Лицензии и реестры →
          </a>
        </div>
      </Container>
    </Section>
  );
}
