import { notFound } from "next/navigation";
import { adminGetTariff, adminListServices } from "@/lib/admin/repos";
import { parseJsonArray } from "@/lib/parseJson";
import { PageHeader } from "@/components/admin/PageHeader";
import { TariffForm } from "@/components/admin/TariffForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTariffPage({ params }: PageProps) {
  const { id } = await params;
  const [tariff, services] = await Promise.all([adminGetTariff(id), adminListServices()]);
  if (!tariff) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title={`Редактирование тарифа: ${tariff.title}`} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <TariffForm
          services={services.map((s) => ({ id: s.id, title: s.title }))}
          initial={{
            id: tariff.id,
            serviceId: tariff.serviceId,
            slug: tariff.slug,
            title: tariff.title,
            speedMbps: tariff.speedMbps,
            priceRub: tariff.priceRub,
            perks: parseJsonArray(tariff.perks),
            highlight: tariff.highlight,
            order: tariff.order,
          }}
        />
      </div>
    </div>
  );
}
