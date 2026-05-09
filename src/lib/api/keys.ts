import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import type { ApiKeyDTO } from "@/types/domain";

export type ApiScope = "read" | "write" | "billing" | "tickets";

export const ALL_SCOPES: ApiScope[] = ["read", "write", "billing", "tickets"];

const KEY_PREFIX = "rtg_";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

interface CreateKeyInput {
  organizationId: string;
  name: string;
  scopes: ApiScope[];
  actorId: string;
}

export async function createApiKey(input: CreateKeyInput): Promise<{
  plain: string;
  record: ApiKeyDTO;
}> {
  const random = randomBytes(24).toString("hex");
  const plain = `${KEY_PREFIX}${random}`;
  const prefix = plain.slice(0, 12);
  const hash = sha256(plain);

  const row = await prisma.apiKey.create({
    data: {
      organizationId: input.organizationId,
      name: input.name,
      prefix,
      hash,
      scopes: JSON.stringify(input.scopes),
    },
  });

  await recordAudit({
    actorId: input.actorId,
    organizationId: input.organizationId,
    action: "api.key.create",
    targetType: "ApiKey",
    targetId: row.id,
    payload: { name: input.name, scopes: input.scopes },
  });

  return {
    plain,
    record: {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      scopes: input.scopes,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: row.createdAt.toISOString(),
    },
  };
}

export async function revokeApiKey(id: string, actorId: string) {
  const key = await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  await recordAudit({
    actorId,
    organizationId: key.organizationId,
    action: "api.key.revoke",
    targetType: "ApiKey",
    targetId: key.id,
  });
}

export async function listOrgApiKeys(organizationId: string): Promise<ApiKeyDTO[]> {
  const rows = await prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    prefix: r.prefix,
    scopes: parseScopes(r.scopes),
    lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
    revokedAt: r.revokedAt ? r.revokedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

function parseScopes(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  } catch {}
  return [];
}

export interface AuthenticatedApiKey {
  id: string;
  organizationId: string;
  scopes: string[];
}

export async function authenticateApiKey(plain: string | null | undefined): Promise<AuthenticatedApiKey | null> {
  if (!plain || !plain.startsWith(KEY_PREFIX)) return null;
  const hash = sha256(plain);
  const row = await prisma.apiKey.findFirst({
    where: { hash, revokedAt: null },
  });
  if (!row) return null;
  // best-effort update of lastUsedAt
  await prisma.apiKey
    .update({ where: { id: row.id }, data: { lastUsedAt: new Date() } })
    .catch(() => null);
  return {
    id: row.id,
    organizationId: row.organizationId,
    scopes: parseScopes(row.scopes),
  };
}

export function requireScope(key: AuthenticatedApiKey, scope: ApiScope): boolean {
  return key.scopes.includes(scope);
}
