import { JsonLd } from "@/components/seo/JsonLd";
import { company } from "@/data/company";
import { siteUrl } from "@/lib/siteUrl";

/**
 * LocalBusiness/TelecommunicationsService JSON-LD для главной и о компании.
 * Расширяет базовый Organization (в root layout) — Google объединяет данные.
 */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${siteUrl()}/#organization`,
    name: company.legalName,
    alternateName: company.name,
    url: siteUrl(),
    logo: `${siteUrl()}/favicon.svg`,
    image: `${siteUrl()}/og-image.svg`,
    email: company.email,
    telephone: company.phoneB2B,
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "AdministrativeArea", name: "Московская область" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: company.phoneB2B,
        contactType: "sales",
        areaServed: "RU",
        availableLanguage: ["Russian"],
      },
      {
        "@type": "ContactPoint",
        telephone: company.phone,
        contactType: "customer service",
        areaServed: "RU",
        availableLanguage: ["Russian"],
      },
    ],
    sameAs: company.socials.map((s) => s.href),
  };
  return <JsonLd data={data} />;
}
