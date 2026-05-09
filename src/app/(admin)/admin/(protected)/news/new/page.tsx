import { PageHeader } from "@/components/admin/PageHeader";
import { NewsForm } from "@/components/admin/NewsForm";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Новая публикация" />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <NewsForm />
      </div>
    </div>
  );
}
