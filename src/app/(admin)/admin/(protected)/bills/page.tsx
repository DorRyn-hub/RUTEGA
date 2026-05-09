import Link from "next/link";
import { adminListBills } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminListBills>>[number];

const fmt = new Intl.NumberFormat("ru-RU");

const STATUS_TONE: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  due: "bg-yellow-50 text-yellow-800",
  overdue: "bg-red-50 text-red-700",
};

export default async function AdminBillsPage() {
  const bills = await adminListBills();
  const columns: Column<Row>[] = [
    { key: "period", header: "Период", render: (b) => b.period },
    { key: "user", header: "Пользователь", render: (b) => `${b.user.fullName} (${b.user.email})` },
    { key: "amount", header: "Сумма", render: (b) => `${fmt.format(b.amount)} ₽` },
    {
      key: "status",
      header: "Статус",
      render: (b) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            STATUS_TONE[b.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      key: "paidAt",
      header: "Оплачен",
      render: (b) => (b.paidAt ? new Intl.DateTimeFormat("ru-RU").format(b.paidAt) : "—"),
    },
    {
      key: "actions",
      header: "Действия",
      className: "w-44 text-right",
      render: (b) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/bills/${b.id}/edit`}>
            <Button size="sm" variant="secondary">
              Изм.
            </Button>
          </Link>
          <DeleteButton url={`/api/admin/bills/${b.id}`} />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Счета"
        description="Платежи и задолженности абонентов."
        actionLabel="+ Новый счёт"
        actionHref="/admin/bills/new"
      />
      <DataTable rows={bills} columns={columns} rowKey={(b) => b.id} empty="Счетов нет" />
    </div>
  );
}
