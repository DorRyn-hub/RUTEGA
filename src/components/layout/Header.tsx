import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { HeaderShell } from "./HeaderShell";
import { HeaderAuthArea } from "./HeaderAuthArea";
import type { NavItem } from "./MobileMenu";
import { CallbackModal } from "@/components/marketing/CallbackModal";
import { A11yToggle } from "@/components/marketing/A11yToggle";
import { company } from "@/data/company";

const navItems: NavItem[] = [
  { href: "/services", label: "Услуги" },
  { href: "/coverage", label: "Карта покрытия" },
  { href: "/cases", label: "Кейсы" },
  { href: "/technologies", label: "Технологии" },
  { href: "/about/team", label: "О компании" },
  { href: "/news", label: "Блог" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  return (
    <HeaderShell>
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Основное меню" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-brand-700)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <A11yToggle className="hidden md:inline-flex" />
          <a
            href={`tel:${company.phoneB2B.replace(/[\s()-]/g, "")}`}
            className="hidden items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-bg)] lg:inline-flex"
          >
            <Phone aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-600)]" />
            <span className="hidden xl:inline">{company.phoneB2B}</span>
          </a>
          <CallbackModal triggerClassName="hidden md:inline-flex" />
          <HeaderAuthArea navItems={navItems} />
        </div>
      </Container>
    </HeaderShell>
  );
}
