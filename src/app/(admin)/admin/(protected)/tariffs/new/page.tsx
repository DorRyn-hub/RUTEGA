import { adminListServices } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { TariffForm } from "@/components/admin/TariffForm";

export default async function NewTariffPage() {
  const services = await adminListServices();
  return (
    <div className="space-y-6">
      <PageHeader title="Новый тариф" />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <TariffForm services={services.map((s) => ({ id: s.id, title: s.title }))} />
      </div>
    </div>
  );
}
