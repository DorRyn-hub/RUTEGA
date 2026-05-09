import "server-only";
import type { CrmLead } from "@/lib/crm/bitrix24";

const API_URL = "https://api.unisender.com/ru/api/sendEmail";

export interface EmailResult {
  ok: boolean;
  reason?: string;
}

/**
 * Отправка email-уведомления админу о новой заявке через Unisender.
 * Используется как fallback и дублирующее уведомление, если CRM лежит или не настроена.
 *
 * Если UNISENDER_API_KEY или ADMIN_ALERT_EMAIL не заданы — no-op (ok: false, no-config).
 */
export async function sendAdminAlert(lead: CrmLead): Promise<EmailResult> {
  const apiKey = process.env.UNISENDER_API_KEY;
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!apiKey || !to) return { ok: false, reason: "no-config" };

  const subject = `[Rutega] Новая заявка (${lead.source}) — ${lead.name}`;
  const bodyText = buildBody(lead);

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      email: to,
      sender_name: "Сайт Rutega",
      sender_email: process.env.UNISENDER_FROM_EMAIL || "noreply@rutega.ru",
      subject,
      body: bodyText,
      list_id: process.env.UNISENDER_LIST_ID || "1",
      lang: "ru",
    });
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) {
      console.warn("unisender non-2xx", res.status);
      return { ok: false, reason: `http-${res.status}` };
    }
    const data = (await res.json()) as {
      result?: unknown;
      error?: string;
    };
    if (data.error) return { ok: false, reason: data.error };
    return { ok: true };
  } catch (e) {
    console.warn("unisender send error", e);
    return { ok: false, reason: "network-error" };
  }
}

function buildBody(lead: CrmLead): string {
  const lines: string[] = [
    "Новая заявка с сайта Rutega.",
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
  ];
  if (lead.email) lines.push(`E-mail: ${lead.email}`);
  if (lead.companyName) lines.push(`Компания: ${lead.companyName}`);
  if (lead.inn) lines.push(`ИНН: ${lead.inn}`);
  if (lead.tariffSlug) lines.push(`Тариф: ${lead.tariffSlug}`);
  lines.push(`Источник: ${lead.source}`);
  if (lead.message) {
    lines.push("", "Сообщение:", lead.message);
  }
  lines.push("", "—", "Это автоматическое уведомление от сайта rutega.ru.");
  return lines.join("\n");
}
