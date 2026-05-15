import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Barlow_Condensed } from "next/font/google";
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
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  variable: "--font-barlow",
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Rutega — корпоративный интернет и сетевая инфраструктура для бизнеса",
    template: "%s | Rutega",
  },
  description:
    "B2B интернет-провайдер для юридических лиц: корпоративный интернет, IP-транзит, L2/L3 VPN, выделенные линии. SLA 99.99% в договоре, поддержка 24/7, NOC.",
  keywords: [
    "Rutega",
    "корпоративный интернет",
    "интернет для бизнеса",
    "IP транзит",
    "L2 VPN",
    "MPLS",
    "выделенные линии",
    "B2B провайдер",
    "интернет для юридических лиц",
    "сетевая безопасность",
  ],
  applicationName: "Rutega",
  authors: [{ name: "Rutega" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Rutega",
    url: "/",
    title: "Rutega — корпоративный интернет для бизнеса",
    description:
      "B2B провайдер: корпоративный интернет, IP-транзит, VPN, выделенные линии. SLA 99.99%, поддержка 24/7.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Rutega" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rutega — корпоративный интернет для бизнеса",
    description: "B2B провайдер: корпоративный интернет, IP-транзит, VPN, выделенные линии.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B107B",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.name,
  url: siteUrl(),
  logo: `${siteUrl()}/logo.png`,
  email: company.email,
  telephone: company.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Москва",
    addressCountry: "RU",
  },
  sameAs: company.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${barlow.variable}`}>
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
