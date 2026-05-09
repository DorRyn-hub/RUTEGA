import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Новая услуга" />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
