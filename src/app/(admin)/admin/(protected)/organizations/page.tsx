import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { listOrganizations } from "@/lib/org/repos";

export const metadata: Metadata = {
  title: "Админ · Организации",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { rows, total } = await listOrganizations({
    q: q ?? undefined,
    page: Number(page ?? "1"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Организации"
        description="Юридические лица — клиенты Rutega B2B Portal."
        actionLabel="Создать организацию"
        actionHref="/admin/organizations/new"
      />
      <form className="admin-form flex flex-wrap items-stretch gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию или ИНН"
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border bg-white px-3 text-sm sm:h-10 sm:max-w-xs"
        />
        <button className="h-11 rounded-[var(--radius-md)] border bg-white px-4 text-sm sm:h-10">
          Найти
        </button>
      </form>
      <Card className="admin-table p-0">
        <div className="border-b px-5 py-3 text-sm text-[var(--color-muted)]">
          Всего: {total}
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[var(--color-muted)]">
              <th className="px-5 py-3 font-medium">Название</th>
              <th className="px-5 py-3 font-medium">ИНН</th>
              <th className="px-5 py-3 font-medium">Менеджер</th>
              <th className="px-5 py-3 font-medium">Сотрудников</th>
              <th className="px-5 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((org) => (
              <tr key={org.id} className="border-b last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/admin/organizations/${org.id}`} className="font-medium hover:underline">
                    {org.shortName ?? org.legalName}
                  </Link>
                  {org.shortName && (
                    <p className="text-xs text-[var(--color-muted)]">{org.legalName}</p>
                  )}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{org.inn}</td>
                <td className="px-5 py-3">{org.accountManager?.fullName ?? "—"}</td>
                <td className="px-5 py-3">{org._count.members}</td>
                <td className="px-5 py-3">
                  <Badge tone={org.status === "active" ? "success" : "warn"}>{org.status}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  Организаций пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
