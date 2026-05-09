import { requireAdmin } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          user={{
            fullName: user.fullName,
            username: user.username ?? null,
            email: user.email,
          }}
        />
        <main className="flex-1 px-3 py-5 sm:px-4 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
