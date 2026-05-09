import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/siteUrl";
import { ToastProvider } from "@/components/ui/Toast";
import { YandexMetrika } from "@/lib/analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { company } from "@/data/company";
import { RouteProgress } from "@/components/motion/RouteProgress";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Rutega — интернет-провайдер: домашний интернет, ТВ, мобильная связь",
    template: "%s | Rutega",
  },
  description:
    "Гигабитный домашний интернет, цифровое ТВ в 4K, мобильная связь и решения для бизнеса. Подключение за 1–3 дня, поддержка 24/7, SLA 99.95%.",
  keywords: [
    "Rutega",
    "интернет провайдер",
    "домашний интернет",
    "цифровое ТВ",
    "мобильная связь",
    "интернет для бизнеса",
    "видеонаблюдение",
  ],
  applicationName: "Rutega",
  authors: [{ name: "Rutega" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Rutega",
    url: "/",
    title: "Rutega — интернет-провайдер",
    description:
      "Домашний интернет до 1 Гбит/с, ТВ в 4K, мобильная связь и решения для бизнеса.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Rutega" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rutega — интернет-провайдер",
    description: "Домашний интернет, ТВ, мобильная связь, бизнес-решения.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B5FFF",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.name,
  url: siteUrl(),
  logo: `${siteUrl()}/favicon.svg`,
  email: company.email,
  telephone: company.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address,
    addressCountry: "RU",
  },
  sameAs: company.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <a href="#main" className="skip-link">
          Перейти к основному содержимому
        </a>
        <ToastProvider>{children}</ToastProvider>
        <JsonLd data={organizationLd} />
        <LocalBusinessJsonLd />
        <YandexMetrika />
      </body>
    </html>
  );
}
