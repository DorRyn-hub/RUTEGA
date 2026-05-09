import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/validation/auth";
import { fromZod, badRequest, serverError, tooManyRequests } from "@/lib/api/respond";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limit = consumeRateLimit(`register:${clientKeyFromRequest(req)}`, {
    capacity: 5,
    refillPerSecond: 5 / 300,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterMs);

  let payload;
  try {
    payload = registerSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (exists) {
      return badRequest("Пользователь с таким e-mail уже зарегистрирован", {
        email: "E-mail уже используется",
      });
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        fullName: payload.fullName,
        phone: payload.phone,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, phone: true, role: true },
    });

    const token = await signSession({ sub: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (err) {
    console.error("register error", err);
    return serverError();
  }
}
