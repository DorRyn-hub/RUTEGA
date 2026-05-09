import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { leadSchema } from "@/lib/validation/lead";
import { fromZod, badRequest, serverError, tooManyRequests } from "@/lib/api/respond";
import { clientKeyFromRequest, consumeRateLimit } from "@/lib/rateLimit";
import { verifySmartCaptcha } from "@/lib/captcha/smartCaptcha";
import { deliverLead } from "@/lib/leadDelivery";

export async function POST(req: NextRequest) {
  const clientKey = clientKeyFromRequest(req);
  const limit = consumeRateLimit(`leads:${clientKey}`, {
    capacity: 3,
    refillPerSecond: 3 / 60,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterMs);

  let payload;
  try {
    payload = leadSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    return badRequest("Некорректный запрос");
  }

  // Honeypot — silently accept without persisting/sending.
  if (payload.website && payload.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const captcha = await verifySmartCaptcha(payload.captchaToken ?? "", clientKey);
  if (!captcha.success) return badRequest("Не пройдена проверка капчи");

  try {
    await deliverLead({
      name: payload.name,
      phone: payload.phone,
      email: payload.email ?? null,
      message: payload.message ?? null,
      source: payload.source,
      tariffSlug: payload.tariffSlug ?? null,
      inn: payload.inn ?? null,
      companyName: payload.companyName ?? null,
      consentMarketing: payload.consentMarketing ?? false,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lead error", err);
    return serverError();
  }
}
