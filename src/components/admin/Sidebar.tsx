"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Tag,
  Newspaper,
  Users,
  Inbox,
  Receipt,
  Building2,
  AlertTriangle,
  Activity,
  Cable,
  Ticket,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Дашборд", exact: true, icon: LayoutDashboard },
  { href: "/admin/organizations", label: "Организации", icon: Building2 },
  { href: "/admin/tickets", label: "Тикеты", icon: Ticket },
  { href: "/admin/connection-requests", label: "Подключения", icon: Cable },
  { href: "/admin/incidents", label: "Инциденты", icon: AlertTriangle },
  { href: "/admin/status", label: "Статус-компоненты", icon: Activity },
  { href: "/admin/billing", label: "Биллинг", icon: Receipt },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/leads", label: "Лиды", icon: Inbox },
  { href: "/admin/bills", label: "Счета (B2C)", icon: Receipt },
  { href: "/admin/services", label: "Услуги", icon: Wrench },
  { href: "/admin/tariffs", label: "Тарифы", icon: Tag },
  { href: "/admin/news", label: "Новости", icon: Newspaper },
  { href: "/admin/audit", label: "Аудит-лог", icon: ShieldAlert },
];

export function NavList({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {ADMIN_NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium transition-colors",
              active
                ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--color-line)] bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-16 items-center border-b border-[var(--color-line)] px-5">
          <Link href="/admin" className="font-display text-lg font-bold text-[var(--color-ink)]">
            Rutega · Admin
          </Link>
        </div>
        <NavList />
        <div className="border-t border-[var(--color-line)] p-3">
          <Link
            href="/"
            className="block rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          >
            ← На сайт
          </Link>
        </div>
      </div>
    </aside>
  );
}
