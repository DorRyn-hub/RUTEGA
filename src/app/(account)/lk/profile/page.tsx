import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth/session";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = {
  title: "Профиль",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Профиль</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Контактные данные используются для уведомлений и связи со специалистами поддержки.
        </p>
      </header>
      <Card>
        <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
      </Card>
    </div>
  );
}
