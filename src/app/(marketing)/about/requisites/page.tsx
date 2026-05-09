import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Реквизиты — Rutega",
  description:
    "Юридические и банковские реквизиты Rutega для договоров, счетов и актов.",
  alternates: { canonical: "/about/requisites" },
};

export default function RequisitesPage() {
  const rows: { label: string; value: string }[] = [
    { label: "Юридическое наименование", value: company.legalName },
    { label: "Бренд", value: company.name },
    { label: "ИНН", value: company.inn },
    { label: "ОГРН", value: company.ogrn },
    { label: "Юридический адрес", value: company.address },
    { label: "Телефон (общий)", value: company.phone },
    { label: "Телефон B2B", value: company.phoneB2B },
    { label: "E-mail", value: company.email },
    { label: "E-mail поддержки", value: company.emailSupport },
    { label: "Режим работы", value: company.workingHours },
  ];

  return (
    <Section tone="default">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "О компании" },
            { label: "Реквизиты" },
          ]}
        />
        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-bold sm:text-5xl">Реквизиты</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Используйте эти данные для договоров, счетов и актов. Банковские реквизиты —
            у вашего менеджера или по запросу на e-mail.
          </p>
        </div>

        <dl className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border bg-white shadow-sm">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={
                i === 0
                  ? "grid gap-1 p-5 sm:grid-cols-[280px_1fr]"
                  : "grid gap-1 border-t p-5 sm:grid-cols-[280px_1fr]"
              }
            >
              <dt className="text-sm font-medium text-[var(--color-muted)]">{r.label}</dt>
              <dd className="text-sm text-[var(--color-ink)]">{r.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
