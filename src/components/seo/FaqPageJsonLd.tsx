import { JsonLd } from "@/components/seo/JsonLd";

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage JSON-LD. Используется на страницах с блоком FAQ (главная, услуги, B2G).
 * Поисковики могут показать rich-snippets «вопрос-ответ» в выдаче.
 */
export function FaqPageJsonLd({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}
