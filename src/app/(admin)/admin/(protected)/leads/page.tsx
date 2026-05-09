import { adminListLeads } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminListLeads>>[number];

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminLeadsPage() {
  const leads = await adminListLeads();
  const columns: Column<Row>[] = [
    { key: "createdAt", header: "Дата", render: (l) => dateFmt.format(l.createdAt) },
    { key: "name", header: "Имя", render: (l) => <span className="font-medium">{l.name}</span> },
    { key: "phone", header: "Телефон", render: (l) => l.phone },
    { key: "email", header: "E-mail", render: (l) => l.email || "—" },
    { key: "source", header: "Источник", render: (l) => l.source },
    { key: "tariff", header: "Тариф", render: (l) => l.tariffSlug || "—" },
    {
      key: "message",
      header: "Сообщение",
      render: (l) => (
        <span className="line-clamp-1 max-w-[300px] text-xs text-[var(--color-muted)]">
          {l.message || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (l) => <DeleteButton url={`/api/admin/leads/${l.id}`} />,
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Заявки" description="Все обращения с сайта (callback / тариф / контакт)." />
      <DataTable rows={leads} columns={columns} rowKey={(l) => l.id} empty="Пока нет заявок" />
    </div>
  );
}
