"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CreditCard,
  Settings2,
  LogOut,
  Building2,
  Ticket,
  Cable,
  ShieldCheck,
  KeyRound,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

interface OrgSummary {
  id: string;
  name: string;
  role: string;
}

interface Section {
  title?: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard; badge?: string }[];
}

const PUBLIC_SECTIONS: Section[] = [
  {
    items: [
      { href: "/lk", label: "Обзор", icon: LayoutDashboard },
      { href: "/lk/services", label: "Мои услуги", icon: Settings2 },
      { href: "/lk/billing", label: "Счета", icon: CreditCard },
      { href: "/lk/profile", label: "Профиль", icon: User },
    ],
  },
];

const B2B_SECTIONS: Section[] = [
  {
    title: "Компания",
    items: [
      { href: "/lk/organization", label: "Организация", icon: Building2 },
      { href: "/lk/tickets", label: "Тикеты", icon: Ticket },
      { href: "/lk/connection-requests", label: "Подключения", icon: Cable },
    ],
  },
  {
    title: "Безопасность и API",
    items: [
      { href: "/lk/security", label: "Безопасность", icon: ShieldCheck },
      { href: "/lk/api-keys", label: "API-ключи", icon: KeyRound },
      { href: "/lk/audit", label: "Журнал действий", icon: Activity },
    ],
  },
];

interface AccountSidebarProps {
  fullName: string;
  email: string;
  organizations?: OrgSummary[];
  activeOrgId?: string | null;
  activeRoleLabel?: string;
}

export function AccountSidebar({
  fullName,
  email,
  organizations = [],
  activeOrgId,
  activeRoleLabel,
}: AccountSidebarProps) {
  const pathname = usePathname() ?? "";
  const [pending, setPending] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function switchOrg(id: string) {
    if (id === activeOrgId) return;
    setPending(id);
    await fetch("/api/lk/active-org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: id }),
    });
    window.location.reload();
  }

  const sections = organizations.length ? [...PUBLIC_SECTIONS, ...B2B_SECTIONS] : PUBLIC_SECTIONS;

  return (
    <aside className="rounded-[var(--radius-lg)] border bg-white p-4 lg:sticky lg:top-20 lg:self-start">
      <div className="mb-4 border-b pb-4">
        <p className="text-sm font-semibold">{fullName}</p>
        <p className="break-all text-xs text-[var(--color-muted)]">{email}</p>
      </div>

      {organizations.length > 0 && (
        <div className="mb-4 border-b pb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Активная организация
          </p>
          <select
            value={activeOrgId ?? ""}
            onChange={(e) => switchOrg(e.target.value)}
            disabled={pending !== null}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-2 py-1.5 text-sm"
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {activeRoleLabel && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">Роль: {activeRoleLabel}</p>
          )}
        </div>
      )}

      <nav aria-label="Меню личного кабинета" className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/lk" && pathname.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-bg)]",
                      )}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-4 flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-danger)]"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Выйти
      </button>
    </aside>
  );
}
