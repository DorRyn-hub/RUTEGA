import Link from "next/link";
import { adminListNews } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof adminListNews>>[number];

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AdminNewsPage() {
  const news = await adminListNews();
  const columns: Column<Row>[] = [
    { key: "title", header: "Заголовок", render: (n) => <span className="font-medium">{n.title}</span> },
    { key: "slug", header: "Slug", render: (n) => <code className="text-xs text-[var(--color-muted)]">{n.slug}</code> },
    { key: "publishedAt", header: "Дата", render: (n) => dateFmt.format(n.publishedAt) },
    {
      key: "actions",
      header: "Действия",
      className: "w-44 text-right",
      render: (n) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/news/${n.id}/edit`}>
            <Button size="sm" variant="secondary">
              Изм.
            </Button>
          </Link>
          <DeleteButton url={`/api/admin/news/${n.id}`} />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Новости"
        description="Публикации в разделе /news."
        actionLabel="+ Новая публикация"
        actionHref="/admin/news/new"
      />
      <DataTable rows={news} columns={columns} rowKey={(n) => n.id} empty="Новостей ещё нет" />
    </div>
  );
}
