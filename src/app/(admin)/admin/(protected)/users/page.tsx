import Link from "next/link";
import { adminQueryUsers } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FilterBar } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { buildQuery } from "@/lib/admin/queryString";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminQueryUsers>>["rows"][number];

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const role = sp.role === "admin" || sp.role === "user" ? sp.role : undefined;
  const status = sp.status === "active" || sp.status === "banned" ? sp.status : undefined;
  const sort = sp.sort || "createdAt.desc";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;
  const limit = Number.parseInt(sp.limit ?? "20", 10) || 20;

  const { rows, total } = await adminQueryUsers({ q, role, status, sort, page, limit });

  const baseParams = { q, role, status, sort, limit };

  const columns: Column<Row>[] = [
    {
      key: "fullName",
      header: "Имя",
      sortKey: "fullName",
      render: (u) => (
        <Link
          href={`/admin/users/${u.id}/edit`}
          className="font-medium hover:text-[var(--color-brand-700)]"
        >
          {u.fullName}
        </Link>
      ),
    },
    { key: "email", header: "E-mail", sortKey: "email", render: (u) => u.email },
    { key: "username", header: "Логин", sortKey: "username", render: (u) => u.username || "—" },
    {
      key: "role",
      header: "Роль",
      sortKey: "role",
      render: (u) =>
        u.role === "admin" ? (
          <span className="inline-flex rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-700)]">
            admin
          </span>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">user</span>
        ),
    },
    {
      key: "status",
      header: "Статус",
      sortKey: "status",
      render: (u) =>
        u.status === "banned" ? (
          <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
            заблокирован
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            активен
          </span>
        ),
    },
    {
      key: "lastLoginAt",
      header: "Последний вход",
      sortKey: "lastLoginAt",
      render: (u) =>
        u.lastLoginAt ? (
          <span className="text-xs text-[var(--color-muted)]">{dateTimeFmt.format(u.lastLoginAt)}</span>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Создан",
      sortKey: "createdAt",
      render: (u) => <span className="text-xs">{dateFmt.format(u.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Действия",
      className: "w-44 text-right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/users/${u.id}/edit`}>
            <Button size="sm" variant="secondary">
              Изм.
            </Button>
          </Link>
          <DeleteButton url={`/api/admin/users/${u.id}`} confirmText="Удалить пользователя?" />
        </div>
      ),
    },
  ];

  const exportHref = buildQuery("/api/admin/users/export", { q, role, status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Пользователи"
        description={`Всего: ${total}. Поиск, фильтры, сортировка, экспорт CSV.`}
      />

      <FilterBar
        action="/admin/users"
        q={q}
        controls={[
          {
            kind: "select",
            name: "role",
            label: "Роль",
            defaultValue: role ?? "",
            options: [
              { value: "", label: "Все" },
              { value: "user", label: "user" },
              { value: "admin", label: "admin" },
            ],
          },
          {
            kind: "select",
            name: "status",
            label: "Статус",
            defaultValue: status ?? "",
            options: [
              { value: "", label: "Все" },
              { value: "active", label: "активен" },
              { value: "banned", label: "заблокирован" },
            ],
          },
        ]}
        resetHref="/admin/users"
        exportHref={exportHref}
      />

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(u) => u.id}
        empty="По заданным фильтрам никого не нашлось"
        sort={sort}
        sortHref={(next) => buildQuery("/admin/users", baseParams, { sort: next, page: 1 })}
      />

      <Pagination
        page={page}
        limit={limit}
        total={total}
        hrefForPage={(p) => buildQuery("/admin/users", baseParams, { page: p })}
      />
    </div>
  );
}
