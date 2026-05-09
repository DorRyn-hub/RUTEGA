import Link from "next/link";
import { adminListServices } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminListServices>>[number];

export default async function AdminServicesPage() {
  const services = await adminListServices();
  const columns: Column<Row>[] = [
    { key: "title", header: "Название", render: (s) => <span className="font-medium">{s.title}</span> },
    { key: "slug", header: "Slug", render: (s) => <code className="text-xs text-[var(--color-muted)]">{s.slug}</code> },
    { key: "category", header: "Категория", render: (s) => s.category },
    { key: "tariffs", header: "Тарифов", render: (s) => s.tariffs.length },
    { key: "order", header: "Порядок", render: (s) => s.order },
    {
      key: "actions",
      header: "Действия",
      className: "w-44 text-right",
      render: (s) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/services/${s.id}/edit`}>
            <Button size="sm" variant="secondary">
              Изм.
            </Button>
          </Link>
          <DeleteButton url={`/api/admin/services/${s.id}`} />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Услуги"
        description="Каталог услуг, отображаемых на маркетинге."
        actionLabel="+ Новая услуга"
        actionHref="/admin/services/new"
      />
      <DataTable rows={services} columns={columns} rowKey={(s) => s.id} empty="Услуг ещё нет" />
    </div>
  );
}
