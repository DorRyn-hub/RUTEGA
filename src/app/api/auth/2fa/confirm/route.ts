import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { confirmTwoFactor } from "@/lib/auth/twoFactor";
import { recordAudit } from "@/lib/audit/log";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({ code: z.string().min(4).max(8) });

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
  if (!parsed.success) return badRequest("Введите код 6 цифр");
  const ok = await confirmTwoFactor(user.id, parsed.data.code);
  if (!ok) return badRequest("Код неверный, попробуйте ещё раз");
  await recordAudit({
    actorId: user.id,
    action: "auth.2fa.enabled",
    targetType: "User",
    targetId: user.id,
  });
  return NextResponse.json({ ok: true });
}
