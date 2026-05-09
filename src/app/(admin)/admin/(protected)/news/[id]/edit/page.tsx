import { notFound } from "next/navigation";
import { adminGetNews } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsForm } from "@/components/admin/NewsForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const item = await adminGetNews(id);
  if (!item) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title={`Редактирование: ${item.title}`} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <NewsForm
          initial={{
            id: item.id,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            body: item.body,
            publishedAt: item.publishedAt.toISOString(),
            cover: item.cover,
          }}
        />
      </div>
    </div>
  );
}
