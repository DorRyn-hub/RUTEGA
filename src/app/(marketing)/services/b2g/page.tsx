import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Решения для госсектора (B2G) — Rutega",
  description:
    "Связь и инфраструктура для государственных учреждений: 44-ФЗ, 223-ФЗ, лицензии связи, ГОСТ-шифрование, размещение данных в РФ.",
  alternates: { canonical: "/services/b2g" },
};

const ADVANTAGES = [
  "Опыт исполнения контрактов по 44-ФЗ и 223-ФЗ без штрафов",
  "Полный пакет лицензий связи и сертификатов",
  "Размещение данных и логов на серверах в РФ",
  "Поддержка ГОСТ-шифрования на стыке (СКЗИ)",
  "Финансовые гарантии SLA в договоре",
  "Ответственный менеджер с опытом работы с госзаказчиком",
];

const PROCESS = [
  {
    title: "1. Заявка и обследование",
    text: "Изучаем ТЗ, проводим выезд на адрес, готовим коммерческое и технические условия.",
  },
  {
    title: "2. Документы для тендера",
    text: "Готовим пакет: лицензии, выписки, образцы оборудования, подтверждения 152-ФЗ.",
  },
  {
    title: "3. Контракт и монтаж",
    text: "Подписание, ввод в эксплуатацию в согласованные сроки. Тестовый запуск с заказчиком.",
  },
  {
    title: "4. Эксплуатация и приёмка",
    text: "Ежемесячные акты, отчёт по SLA, работа с замечаниями. Ежегодное продление по рамке.",
  },
];

export default function B2GPage() {
  return (
    <>
      <Section tone="default">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Услуги", href: "/services" },
              { label: "Госсектор (B2G)" },
            ]}
          />
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                B2G · 44-ФЗ / 223-ФЗ
              </span>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                Решения для госсектора
              </h1>
              <p className="mt-3 text-lg text-[var(--color-muted)]">
                Каналы связи, L2/L3-VPN, размещение данных и ЭДО для государственных
                учреждений и подведомственных организаций. Готовим документы под тендеры.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {ADVANTAGES.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]"
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <LeadForm
                source="contact"
                title="Запрос для тендера"
                description="Опишите задачу — пришлём ТКП и пакет документов в течение рабочего дня."
                submitLabel="Запросить ТКП"
                variant="two-step"
                redirectToThanks
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Как мы работаем</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <li
                key={p.title}
                className="rounded-[var(--radius-lg)] border bg-white p-5 shadow-sm"
              >
                <h3 className="font-display text-base font-semibold text-[var(--color-brand-700)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{p.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
