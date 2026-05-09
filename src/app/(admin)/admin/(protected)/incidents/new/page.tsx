import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { listStatusComponents } from "@/lib/sla/engine";
import { NewIncidentForm } from "./NewIncidentForm";

export const metadata: Metadata = {
  title: "Админ · Новый инцидент",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewIncidentPage() {
  const [services, components] = await Promise.all([
    prisma.service.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    listStatusComponents(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Новый инцидент"
        description="Опишите проблему. Затронутые компоненты будут автоматически переведены в неработающее состояние."
      />
      <Card>
        <NewIncidentForm services={services} components={components} />
      </Card>
    </div>
  );
}
