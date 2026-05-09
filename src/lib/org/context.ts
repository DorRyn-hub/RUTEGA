import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, type OrgPermission } from "@/lib/auth/permissions";
import type { OrgRole, OrganizationDTO } from "@/types/domain";

export const ACTIVE_ORG_COOKIE = "rutega_active_org";

export interface ActiveOrgContext {
  org: OrganizationDTO;
  role: OrgRole;
  membershipId: string;
}

interface MembershipRow {
  id: string;
  role: string;
  organization: {
    id: string;
    inn: string;
    kpp: string | null;
    ogrn: string | null;
    legalName: string;
    shortName: string | null;
    legalAddress: string;
    postalAddress: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: string;
    twoFactorRequired: boolean;
    accountManager: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
    } | null;
  };
}

function toOrgDTO(row: MembershipRow["organization"]): OrganizationDTO {
  return {
    id: row.id,
    inn: row.inn,
    kpp: row.kpp,
    ogrn: row.ogrn,
    legalName: row.legalName,
    shortName: row.shortName,
    legalAddress: row.legalAddress,
    postalAddress: row.postalAddress,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    status: row.status,
    twoFactorRequired: row.twoFactorRequired,
    accountManager: row.accountManager
      ? {
          id: row.accountManager.id,
          fullName: row.accountManager.fullName,
          email: row.accountManager.email,
          phone: row.accountManager.phone,
        }
      : null,
  };
}

export const getUserMemberships = cache(async (): Promise<{
  membershipId: string;
  role: OrgRole;
  organization: OrganizationDTO;
}[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = (await prisma.organizationMember.findMany({
    where: { userId: user.id, acceptedAt: { not: null } },
    include: {
      organization: {
        include: {
          accountManager: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      },
    },
    orderBy: { invitedAt: "asc" },
  })) as MembershipRow[];
  return rows.map((m) => ({
    membershipId: m.id,
    role: m.role as OrgRole,
    organization: toOrgDTO(m.organization),
  }));
});

export const getActiveOrgContext = cache(async (): Promise<ActiveOrgContext | null> => {
  const memberships = await getUserMemberships();
  if (memberships.length === 0) return null;

  const store = await cookies();
  const cookieValue = store.get(ACTIVE_ORG_COOKIE)?.value ?? null;
  const chosen =
    memberships.find((m) => m.organization.id === cookieValue) ?? memberships[0];
  if (!chosen) return null;

  return {
    org: chosen.organization,
    role: chosen.role,
    membershipId: chosen.membershipId,
  };
});

export async function requireOrgContext(): Promise<ActiveOrgContext> {
  const ctx = await getActiveOrgContext();
  if (!ctx) {
    redirect("/lk/organization/new");
  }
  return ctx;
}

export async function requireOrgPermission(perm: OrgPermission): Promise<ActiveOrgContext> {
  const ctx = await requireOrgContext();
  if (!hasPermission(ctx.role, perm)) {
    redirect("/lk?forbidden=" + encodeURIComponent(perm));
  }
  return ctx;
}

export async function setActiveOrgCookie(orgId: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: ACTIVE_ORG_COOKIE,
    value: orgId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
