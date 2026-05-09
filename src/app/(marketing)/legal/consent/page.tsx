import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description:
    "Шаблон согласия на обработку персональных данных Rutega в соответствии с 152-ФЗ.",
  alternates: { canonical: "/legal/consent" },
};

export default function ConsentPage() {
  return (
    <Section tone="default">
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Согласие на обработку ПД" },
          ]}
        />
        <article className="prose-rutega mt-6">
          <h1>Согласие на обработку персональных данных</h1>
          <p>
            Отправляя форму на сайте {company.name}, я даю {company.legalName} согласие на
            обработку своих персональных данных (имя, телефон, e-mail, адрес подключения) в целях:
          </p>
          <ul>
            <li>заключения и исполнения договора оказания услуг связи;</li>
            <li>обратной связи по моим обращениям;</li>
            <li>информирования о новых продуктах и тарифах;</li>
            <li>улучшения качества обслуживания.</li>
          </ul>
          <p>
            Согласие действует с момента отправки формы и до его отзыва. Отзыв согласия можно
            направить на e-mail{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
          <p>
            <em>
              Это шаблонный текст для MVP. Перед публикацией на проде требуется правовая ревизия.
            </em>
          </p>
        </article>
      </Container>
    </Section>
  );
}
