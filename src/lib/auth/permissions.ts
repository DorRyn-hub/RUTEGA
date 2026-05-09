import type { OrgRole } from "@/types/domain";

export type OrgPermission =
  | "members.read"
  | "members.write"
  | "billing.read"
  | "billing.pay"
  | "services.read"
  | "services.write"
  | "tickets.read"
  | "tickets.write"
  | "incidents.read"
  | "connection.read"
  | "connection.write"
  | "settings.read"
  | "settings.write"
  | "api.read"
  | "api.write"
  | "audit.read";

const ROLE_PERMS: Record<OrgRole, OrgPermission[]> = {
  director: [
    "members.read",
    "members.write",
    "billing.read",
    "billing.pay",
    "services.read",
    "services.write",
    "tickets.read",
    "tickets.write",
    "incidents.read",
    "connection.read",
    "connection.write",
    "settings.read",
    "settings.write",
    "api.read",
    "api.write",
    "audit.read",
  ],
  accountant: [
    "members.read",
    "billing.read",
    "billing.pay",
    "services.read",
    "tickets.read",
    "tickets.write",
    "incidents.read",
    "connection.read",
    "settings.read",
    "audit.read",
  ],
  tech: [
    "members.read",
    "services.read",
    "services.write",
    "tickets.read",
    "tickets.write",
    "incidents.read",
    "connection.read",
    "connection.write",
    "settings.read",
    "api.read",
  ],
  viewer: [
    "members.read",
    "billing.read",
    "services.read",
    "tickets.read",
    "incidents.read",
    "connection.read",
    "settings.read",
  ],
};

export function rolePermissions(role: OrgRole): OrgPermission[] {
  return ROLE_PERMS[role] ?? [];
}

export function hasPermission(role: OrgRole | undefined | null, perm: OrgPermission): boolean {
  if (!role) return false;
  return ROLE_PERMS[role]?.includes(perm) ?? false;
}

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  director: "Директор",
  accountant: "Бухгалтер",
  tech: "Технический специалист",
  viewer: "Наблюдатель",
};

export const ORG_ROLES: OrgRole[] = ["director", "accountant", "tech", "viewer"];

export function isOrgRole(value: unknown): value is OrgRole {
  return typeof value === "string" && (ORG_ROLES as string[]).includes(value);
}
