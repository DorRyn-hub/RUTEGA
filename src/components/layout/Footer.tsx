import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { company } from "@/data/company";

const linkGroups = [
  {
    title: "Бизнесу",
    items: [
      { href: "/services/business-internet", label: "Интернет для бизнеса" },
      { href: "/services/b2g", label: "Решения для госсектора (B2G)" },
      { href: "/coverage", label: "Карта покрытия" },
      { href: "/cases", label: "Кейсы" },
    ],
  },
  {
    title: "О компании",
    items: [
      { href: "/about/team", label: "Команда" },
      { href: "/about/licenses", label: "Лицензии и сертификаты" },
      { href: "/about/requisites", label: "Реквизиты" },
      { href: "/technologies", label: "Технологии и инфраструктура" },
    ],
  },
  {
    title: "Помощь",
    items: [
      { href: "/support", label: "Поддержка и FAQ" },
      { href: "/news", label: "Блог" },
      { href: "/contacts", label: "Контакты" },
      { href: "/lk/login", label: "Личный кабинет" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-[var(--color-muted)]">
            B2B/B2G-провайдер с собственной оптикой и радиоканалами по Москве.
            Интернет, L2/L3-VPN, ЦОД, ИП-телефония — в одном договоре с финансовыми
            гарантиями SLA.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-600)]" />
              <a href={`tel:${company.phoneB2B.replace(/[\s()-]/g, "")}`} className="hover:underline">
                {company.phoneB2B}
              </a>
              <span className="text-[var(--color-muted)]">— B2B/B2G</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-600)]" />
              <a href={`tel:${company.phone.replace(/[\s()-]/g, "")}`} className="hover:underline">
                {company.phone}
              </a>
              <span className="text-[var(--color-muted)]">— общая линия</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-600)]" />
              <a href={`mailto:${company.email}`} className="hover:underline">
                {company.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 text-[var(--color-brand-600)]" />
              <span>{company.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-600)]" />
              <span>{company.workingHours}</span>
            </li>
          </ul>
          <ul className="mt-5 flex items-center gap-3">
            {company.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-[var(--color-brand-700)] transition-colors hover:bg-[var(--color-brand-50)]"
                >
                  <Icon name={s.iconKey} className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {linkGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold tracking-wide text-[var(--color-ink)]">
              {group.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-brand-700)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t py-6">
        <Container className="flex flex-col items-start justify-between gap-3 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {company.legalName}. Все права защищены. ИНН {company.inn},
            ОГРН {company.ogrn}.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/legal/privacy" className="hover:text-[var(--color-brand-700)]">
              Политика конфиденциальности
            </Link>
            <Link href="/legal/consent" className="hover:text-[var(--color-brand-700)]">
              Согласие на обработку ПД
            </Link>
            <Link href="/about/requisites" className="hover:text-[var(--color-brand-700)]">
              Реквизиты
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
