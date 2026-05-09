import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/cookies";
import { verifyLoginToken } from "@/lib/auth/twoFactor";
import { readPendingChallenge, clearPendingChallenge } from "@/lib/auth/loginPending";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/api/respond";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/rateLimit";
import { recordAudit } from "@/lib/audit/log";

const schema = z.object({ code: z.string().min(4).max(20) });

export async function POST(req: NextRequest) {
  const limit = consumeRateLimit(`login2fa:${clientKeyFromRequest(req)}`, {
    capacity: 8,
    refillPerSecond: 8 / 300,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterMs);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Введите 6-значный код");

  const userId = await readPendingChallenge();
  if (!userId) return unauthorized("Сессия 2FA истекла. Войдите снова.");

  const ok = await verifyLoginToken(userId, parsed.data.code);
  if (!ok) {
    await recordAudit({
      actorId: userId,
      action: "auth.login.2fa_fail",
      targetType: "User",
      targetId: userId,
    });
    return badRequest("Неверный код подтверждения");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, phone: true, username: true, role: true },
    });
    if (!user) return unauthorized();
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);
    await clearPendingChallenge();
    await recordAudit({
      actorId: user.id,
      action: "auth.login.success_2fa",
      targetType: "User",
      targetId: user.id,
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("login-2fa error", err);
    return serverError();
  }
}
