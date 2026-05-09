import { notFound } from "next/navigation";
import { adminGetService } from "@/lib/admin/repos";
import { parseJsonArray } from "@/lib/parseJson";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const service = await adminGetService(id);
  if (!service) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title={`Редактирование: ${service.title}`} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <ServiceForm
          initial={{
            id: service.id,
            slug: service.slug,
            title: service.title,
            category: service.category,
            shortText: service.shortText,
            description: service.description,
            iconKey: service.iconKey,
            features: parseJsonArray(service.features),
            order: service.order,
          }}
        />
      </div>
    </div>
  );
}
