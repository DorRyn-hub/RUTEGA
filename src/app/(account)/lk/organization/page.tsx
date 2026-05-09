import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getActiveOrgContext } from "@/lib/org/context";
import { getOrgMembers, getOrgSites } from "@/lib/org/repos";
import { ORG_ROLE_LABELS, hasPermission } from "@/lib/auth/permissions";

export const metadata: Metadata = {
  title: "Организация",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Организация</h1>
        <p className="text-[var(--color-muted)]">
          За вами не закреплено ни одной организации. Обратитесь к менеджеру или директору.
        </p>
      </div>
    );
  }
  const [members, sites] = await Promise.all([
    getOrgMembers(ctx.org.id),
    getOrgSites(ctx.org.id),
  ]);
  const canManage = hasPermission(ctx.role, "members.write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">{ctx.org.legalName}</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          ИНН {ctx.org.inn}
          {ctx.org.kpp ? ` · КПП ${ctx.org.kpp}` : ""}
          {ctx.org.ogrn ? ` · ОГРН ${ctx.org.ogrn}` : ""}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Реквизиты</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Юр. адрес" value={ctx.org.legalAddress} />
            <Row label="Почтовый адрес" value={ctx.org.postalAddress ?? "—"} />
            <Row label="E-mail" value={ctx.org.contactEmail ?? "—"} />
            <Row label="Телефон" value={ctx.org.contactPhone ?? "—"} />
            <Row label="Статус" value={<Badge tone={ctx.org.status === "active" ? "success" : "warn"}>{ctx.org.status}</Badge>} />
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Персональный менеджер</h2>
          {ctx.org.accountManager ? (
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-base font-medium">{ctx.org.accountManager.fullName}</p>
              <p className="text-[var(--color-muted)]">{ctx.org.accountManager.email}</p>
              {ctx.org.accountManager.phone && (
                <p className="text-[var(--color-muted)]">{ctx.org.accountManager.phone}</p>
              )}
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Закреплён как ваш персональный аккаунт-менеджер. Доступен напрямую через тикет-систему.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[var(--color-muted)]">
              Менеджер пока не назначен. Свяжитесь с поддержкой.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Сотрудники с доступом</h2>
          <span className="text-sm text-[var(--color-muted)]">
            {members.length} {members.length === 1 ? "сотрудник" : "сотрудников"}
          </span>
        </div>
        <ul className="mt-4 divide-y">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{m.fullName}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {m.email}
                  {m.position ? ` · ${m.position}` : ""}
                </p>
              </div>
              <Badge tone="info">{ORG_ROLE_LABELS[m.role]}</Badge>
            </li>
          ))}
        </ul>
        {canManage && (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Добавление и приглашение сотрудников выполняется через службу заботы (форма приглашений будет добавлена при подключении email-сервиса).
          </p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Площадки и подключения</h2>
          <span className="text-sm text-[var(--color-muted)]">{sites.length} объектов</span>
        </div>
        <ul className="mt-4 divide-y">
          {sites.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-[var(--color-muted)]">{s.address}</p>
              </div>
              <Badge tone={s.status === "active" ? "success" : "warn"}>{s.status}</Badge>
            </li>
          ))}
          {sites.length === 0 && (
            <li className="py-6 text-sm text-[var(--color-muted)]">
              Площадок пока нет. Запросите подключение нового офиса в разделе «Подключения».
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
