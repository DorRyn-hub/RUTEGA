import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Лицензии и сертификаты — Rutega",
  description:
    "Лицензии Роскомнадзора, реестр операторов связи, сертификаты соответствия Rutega. Документы для тендеров 44-ФЗ / 223-ФЗ.",
  alternates: { canonical: "/about/licenses" },
};

const LICENSES = [
  {
    title: "Лицензия на оказание услуг связи",
    issuer: "Роскомнадзор",
    note: "Услуги местной телефонной связи и услуги связи по передаче данных. Действует на территории РФ.",
  },
  {
    title: "Реестр операторов связи",
    issuer: "Роскомнадзор",
    note: "Включены в единый реестр операторов связи. Запись актуальна и проверяется на сайте РКН.",
  },
  {
    title: "Уведомление о начале обработки ПДн",
    issuer: "Роскомнадзор",
    note: "Уведомление подано. Ответственный за обработку персональных данных назначен.",
  },
  {
    title: "Соответствие 152-ФЗ",
    issuer: "Внутренний аудит",
    note: "Хранение и обработка ПДн на серверах в РФ. Меры технической защиты в соответствии с приказами ФСТЭК.",
  },
  {
    title: "Договоры с НИИ Радио / Минкомсвязи",
    issuer: "Профильные ведомства",
    note: "Регистрация РЭС в части радиоканалов, согласование частот и мощностей.",
  },
];

export default function LicensesPage() {
  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "О компании" },
            { label: "Лицензии" },
          ]}
        />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Лицензии и сертификаты</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Полный пакет документов для участия в тендерах 44-ФЗ и 223-ФЗ. Сканы и
            заверенные копии — по запросу через менеджера.
          </p>
        </div>

        <ul className="mt-10 grid gap-4">
          {LICENSES.map((l) => (
            <li
              key={l.title}
              className="rounded-[var(--radius-lg)] border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-display text-lg font-semibold">{l.title}</div>
                <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {l.issuer}
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{l.note}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-[var(--color-muted)]">
          Нужны заверенные копии или дополнительные документы?{" "}
          <a href="/contacts" className="text-[var(--color-brand-700)] underline">
            Напишите нам
          </a>{" "}
          — пришлём в течение рабочего дня.
        </p>
      </Container>
    </Section>
  );
}
