import Link from "next/link";
import { UserPlus, MailPlus, BadgeCheck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { AdminActivityItem } from "@/lib/admin/repos";

const ICON: Record<AdminActivityItem["kind"], React.ComponentType<{ className?: string }>> = {
  user: UserPlus,
  lead: MailPlus,
  bill: BadgeCheck,
};

const TONE: Record<AdminActivityItem["kind"], string> = {
  user: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
  lead: "bg-amber-50 text-amber-700",
  bill: "bg-emerald-50 text-emerald-700",
};

export function ActivityFeed({ items }: { items: AdminActivityItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-[var(--color-muted)]">Активности пока нет.</p>;
  }
  return (
    <ul className="divide-y divide-[var(--color-line)]">
      {items.map((item, idx) => {
        const Icon = ICON[item.kind];
        return (
          <li key={`${item.kind}-${idx}`} className="flex items-start gap-3 py-3">
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE[item.kind]}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={item.href}
                className="block truncate text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-brand-700)]"
              >
                {item.title}
              </Link>
              <p className="truncate text-xs text-[var(--color-muted)]">{item.subtitle}</p>
            </div>
            <time className="shrink-0 text-xs text-[var(--color-muted)]" dateTime={item.at.toISOString()}>
              {formatDateTime(item.at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
