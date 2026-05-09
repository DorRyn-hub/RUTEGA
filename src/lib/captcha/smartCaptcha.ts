import "server-only";

const VERIFY_URL = "https://smartcaptcha.yandexcloud.net/validate";

export interface CaptchaVerifyResult {
  success: boolean;
  reason?: string;
}

/**
 * Server-to-server проверка токена SmartCaptcha.
 * Если SMARTCAPTCHA_SERVER_KEY не задан — возвращает success: true (dev-режим).
 * Также пропускает токен "dev-bypass" и "captcha-unavailable" (когда CDN Я.Облака лежит).
 */
export async function verifySmartCaptcha(
  token: string,
  ip?: string,
): Promise<CaptchaVerifyResult> {
  const serverKey = process.env.SMARTCAPTCHA_SERVER_KEY;
  if (!serverKey) return { success: true, reason: "no-server-key" };
  if (token === "dev-bypass") return { success: true, reason: "dev-bypass" };
  if (token === "captcha-unavailable") {
    // CDN недоступен на клиенте. Допускаем заявку, помечаем причину.
    return { success: true, reason: "captcha-cdn-unavailable" };
  }
  if (!token) return { success: false, reason: "empty-token" };

  try {
    const params = new URLSearchParams({ secret: serverKey, token });
    if (ip) params.set("ip", ip);
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      // важный таймаут — иначе при недоступности зависнет рукоятка формы
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("smartcaptcha non-2xx", res.status);
      return { success: false, reason: `http-${res.status}` };
    }
    const data = (await res.json()) as { status?: string; message?: string };
    if (data.status === "ok") return { success: true };
    return { success: false, reason: data.message || data.status || "unknown" };
  } catch (e) {
    console.warn("smartcaptcha verify error", e);
    // Сетевая ошибка к Я.Облаку — не блокируем заявку.
    return { success: true, reason: "verify-network-error" };
  }
}
