import Link from "next/link";
import { adminListTariffs } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminListTariffs>>[number];

const fmt = new Intl.NumberFormat("ru-RU");

export default async function AdminTariffsPage() {
  const tariffs = await adminListTariffs();
  const columns: Column<Row>[] = [
    { key: "title", header: "Название", render: (t) => <span className="font-medium">{t.title}</span> },
    { key: "service", header: "Услуга", render: (t) => t.service.title },
    { key: "slug", header: "Slug", render: (t) => <code className="text-xs text-[var(--color-muted)]">{t.slug}</code> },
    { key: "speed", header: "Скорость", render: (t) => (t.speedMbps ? `${t.speedMbps} Мбит/с` : "—") },
    { key: "price", header: "Цена", render: (t) => `${fmt.format(t.priceRub)} ₽` },
    {
      key: "highlight",
      header: "Хит",
      render: (t) => (t.highlight ? <span className="text-[var(--color-brand-700)]">★</span> : "—"),
    },
    {
      key: "actions",
      header: "Действия",
      className: "w-44 text-right",
      render: (t) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/tariffs/${t.id}/edit`}>
            <Button size="sm" variant="secondary">
              Изм.
            </Button>
          </Link>
          <DeleteButton url={`/api/admin/tariffs/${t.id}`} />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Тарифы"
        description="Тарифные планы по каждой услуге."
        actionLabel="+ Новый тариф"
        actionHref="/admin/tariffs/new"
      />
      <DataTable rows={tariffs} columns={columns} rowKey={(t) => t.id} empty="Тарифов ещё нет" />
    </div>
  );
}
