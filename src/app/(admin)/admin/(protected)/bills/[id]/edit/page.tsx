import { notFound } from "next/navigation";
import { adminGetBill, adminListUsers } from "@/lib/admin/repos";
import { PageHeader } from "@/components/admin/PageHeader";
import { BillForm } from "@/components/admin/BillForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBillPage({ params }: PageProps) {
  const { id } = await params;
  const [bill, users] = await Promise.all([adminGetBill(id), adminListUsers()]);
  if (!bill) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title={`Счёт ${bill.period} — ${bill.user.fullName}`} />
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6">
        <BillForm
          users={users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName }))}
          initial={{
            id: bill.id,
            userId: bill.userId,
            amount: bill.amount,
            status: bill.status as "paid" | "due" | "overdue",
            period: bill.period,
            paidAt: bill.paidAt ? bill.paidAt.toISOString() : null,
          }}
        />
      </div>
    </div>
  );
}
