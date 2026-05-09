import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { NewOrgForm } from "./NewOrgForm";

export const metadata: Metadata = {
  title: "Админ · Создать организацию",
  robots: { index: false, follow: false },
};

export default function NewOrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Новая организация" description="Создайте юр. лицо вручную (импорт из ЕГРЮЛ — отдельная фича)." />
      <Card>
        <NewOrgForm />
      </Card>
    </div>
  );
}
