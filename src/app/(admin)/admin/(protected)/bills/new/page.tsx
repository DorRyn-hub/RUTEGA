import { adminListUsers } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { BillForm } from "@/components/admin/BillForm";

export default async function NewBillPage() {
  const users = await adminListUsers();
  return (
    <div className="space-y-6">
      <PageHeader title="Новый счёт" />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <BillForm
          users={users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName }))}
        />
      </div>
    </div>
  );
}
