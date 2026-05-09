import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/validation/auth";
import { fromZod, badRequest, serverError, tooManyRequests } from "@/lib/api/respond";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/rateLimit";
import { isTwoFactorEnabled } from "@/lib/auth/twoFactor";
import { issuePendingChallenge } from "@/lib/auth/loginPending";
import { recordAudit } from "@/lib/audit/log";

export async function POST(req: NextRequest) {
  const limit = consumeRateLimit(`login:${clientKeyFromRequest(req)}`, {
    capacity: 5,
    refillPerSecond: 5 / 300,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterMs);

  let payload;
  try {
    payload = loginSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  try {
    const identifier = payload.identifier.trim();
    const isEmail = identifier.includes("@");
    const where = isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };
    const user = await prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        username: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });
    if (!user) return badRequest("Неверный e-mail/логин или пароль");

    const ok = await verifyPassword(payload.password, user.passwordHash);
    if (!ok) return badRequest("Неверный e-mail/логин или пароль");

    if (user.status === "banned") {
      return badRequest("Учётная запись заблокирована. Обратитесь в поддержку.");
    }

    const requires2fa = await isTwoFactorEnabled(user.id);
    if (requires2fa) {
      await issuePendingChallenge(user.id);
      await recordAudit({
        actorId: user.id,
        action: "auth.login.password_ok",
        targetType: "User",
        targetId: user.id,
      });
      return NextResponse.json({ requires2fa: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);
    await recordAudit({
      actorId: user.id,
      action: "auth.login.success",
      targetType: "User",
      targetId: user.id,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return serverError();
  }
}
