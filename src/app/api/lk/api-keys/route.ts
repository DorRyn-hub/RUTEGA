import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { ALL_SCOPES, createApiKey, listOrgApiKeys, revokeApiKey } from "@/lib/api/keys";
import { badRequest, unauthorized } from "@/lib/api/respond";

const SCOPES = ALL_SCOPES as [string, ...string[]];
const schema = z.object({
  name: z.string().min(2).max(80),
  scopes: z.array(z.enum(SCOPES)).min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const ctx = await requireOrgPermission("api.read");
  const keys = await listOrgApiKeys(ctx.org.id);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const ctx = await requireOrgPermission("api.write");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Укажите имя ключа и хотя бы один scope");
  const created = await createApiKey({
    organizationId: ctx.org.id,
    name: parsed.data.name,
    scopes: parsed.data.scopes as ("read" | "write" | "billing" | "tickets")[],
    actorId: user.id,
  });
  return NextResponse.json({ key: created.record, plain: created.plain });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  await requireOrgPermission("api.write");
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return badRequest("id обязателен");
  await revokeApiKey(id, user.id);
  return NextResponse.json({ ok: true });
}
