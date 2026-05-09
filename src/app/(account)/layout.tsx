import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveOrgContext, getUserMemberships } from "@/lib/org/context";
import { ORG_ROLE_LABELS } from "@/lib/auth/permissions";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/lk/login");

  const [memberships, ctx] = await Promise.all([
    getUserMemberships(),
    getActiveOrgContext(),
  ]);

  const orgs = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.shortName ?? m.organization.legalName,
    role: m.role,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1 bg-[var(--color-bg)] py-8 lg:py-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
            <AccountSidebar
              fullName={user.fullName}
              email={user.email}
              organizations={orgs}
              activeOrgId={ctx?.org.id ?? null}
              activeRoleLabel={ctx ? ORG_ROLE_LABELS[ctx.role] : undefined}
            />
            <div>{children}</div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
