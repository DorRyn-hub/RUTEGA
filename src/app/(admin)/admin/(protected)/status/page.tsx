import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { listStatusComponents } from "@/lib/sla/engine";
import { StatusComponentsManager } from "./StatusComponentsManager";

export const metadata: Metadata = {
  title: "Админ · Статус-компоненты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStatusPage() {
  const components = await listStatusComponents();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Статус-компоненты"
        description="Что показывается на публичной странице статуса. При создании инцидента статус компонента переключается автоматически."
      />
      <Card>
        <StatusComponentsManager components={components} />
      </Card>
    </div>
  );
}
