import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserMemberships, setActiveOrgCookie } from "@/lib/org/context";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({ organizationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("organizationId обязателен");
  const memberships = await getUserMemberships();
  if (!memberships.some((m) => m.organization.id === parsed.data.organizationId)) {
    return badRequest("Нет доступа к этой организации");
  }
  await setActiveOrgCookie(parsed.data.organizationId);
  return NextResponse.json({ ok: true });
}
