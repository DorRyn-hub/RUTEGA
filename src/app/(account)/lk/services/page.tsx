import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserServices } from "@/lib/repos";
import { MyServicesList } from "./MyServicesList";

export const metadata: Metadata = {
  title: "Мои услуги",
  robots: { index: false, follow: false },
};

export default async function MyServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");
  const services = await getUserServices(user.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Мои услуги</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Управляйте подписками и подключайте новые услуги в каталоге.
          </p>
        </div>
        <LinkButton href="/services" variant="secondary">
          Каталог услуг
        </LinkButton>
      </header>

      {services.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--color-muted)]">
            У вас пока нет подключённых услуг. Перейдите в каталог, чтобы добавить.
          </p>
        </Card>
      ) : (
        <MyServicesList items={services} />
      )}
    </div>
  );
}
