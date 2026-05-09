import { notFound } from "next/navigation";
import { adminGetUser } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm } from "@/components/admin/UserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await adminGetUser(id);
  if (!user) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title={`Пользователь: ${user.fullName}`} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <UserForm
          initial={{
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            status: user.status,
          }}
        />
      </div>
    </div>
  );
}
