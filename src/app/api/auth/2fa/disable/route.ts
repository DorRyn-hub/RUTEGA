import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { disableTwoFactor } from "@/lib/auth/twoFactor";
import { unauthorized } from "@/lib/api/respond";
import { recordAudit } from "@/lib/audit/log";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  await disableTwoFactor(user.id);
  await recordAudit({
    actorId: user.id,
    action: "auth.2fa.disabled",
    targetType: "User",
    targetId: user.id,
  });
  return NextResponse.json({ ok: true });
}
