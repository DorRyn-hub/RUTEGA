import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  OrgRole,
  OrganizationDTO,
  OrganizationMemberDTO,
  SiteDTO,
} from "@/types/domain";

export async function listOrganizations(params: {
  q?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const where: Record<string, unknown> = {};
  if (params.q && params.q.trim()) {
    const q = params.q.trim();
    where.OR = [
      { legalName: { contains: q } },
      { inn: { contains: q } },
      { shortName: { contains: q } },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        accountManager: { select: { id: true, fullName: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.organization.count({ where }),
  ]);
  return { rows, total, page, limit };
}

export async function getOrgMembers(organizationId: string): Promise<OrganizationMemberDTO[]> {
  const rows = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
    orderBy: { invitedAt: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role as OrgRole,
    position: m.position,
    fullName: m.user.fullName,
    email: m.user.email,
    phone: m.user.phone,
    acceptedAt: m.acceptedAt ? m.acceptedAt.toISOString() : null,
  }));
}

export async function getOrgSites(organizationId: string): Promise<SiteDTO[]> {
  const rows = await prisma.site.findMany({
    where: { organizationId },
    orderBy: { title: "asc" },
  });
  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    status: s.status,
  }));
}

export async function getOrgById(id: string): Promise<OrganizationDTO | null> {
  const row = await prisma.organization.findUnique({
    where: { id },
    include: {
      accountManager: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
    },
  });
  if (!row) return null;
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
