import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { cookies, headers } from "next/headers";
import {
  DEMO_COOKIE,
  DEMO_TTL_SECONDS,
  getDemoCredentials,
  isDemoGateEnabled,
  signDemoToken,
} from "@/lib/auth/demoGate";
import { badRequest, fromZod, serverError, tooManyRequests } from "@/lib/api/respond";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/rateLimit";

const schema = z.object({
  identifier: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export async function POST(req: NextRequest) {
  const limit = consumeRateLimit(`demo:${clientKeyFromRequest(req)}`, {
    capacity: 5,
    refillPerSecond: 5 / 60,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterMs);

  if (!isDemoGateEnabled()) {
    return NextResponse.json({ ok: true, disabled: true });
  }

  let payload;
  try {
    payload = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  try {
    const { user, pass } = getDemoCredentials();
    if (payload.identifier.trim() !== user || payload.password !== pass) {
      return badRequest("Неверный логин или пароль");
    }
    const token = await signDemoToken();
    const h = await headers();
    const proto =
      h.get("x-forwarded-proto") ??
      (h.get("forwarded")?.match(/proto=([^;]+)/i)?.[1] ?? "");
    const host = h.get("host") ?? "";
    const isLocalhost = /^(localhost|127\.|\[::1\])/i.test(host);
    const secure = !isLocalhost && proto.toLowerCase() === "https";
    const store = await cookies();
    store.set({
      name: DEMO_COOKIE,
      value: token,
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: DEMO_TTL_SECONDS,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("demo-access error", err);
    return serverError();
  }
}
