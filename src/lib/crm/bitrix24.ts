import "server-only";

export interface CrmLead {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source: string; // callback | tariff | contact | calculator
  inn?: string | null;
  companyName?: string | null;
  tariffSlug?: string | null;
}

export interface CrmResult {
  ok: boolean;
  externalId?: string;
  reason?: string;
}

/**
 * Отправка лида в Bitrix24 через входящий webhook.
 * Webhook URL имеет вид https://<домен>.bitrix24.ru/rest/<user>/<token>/
 * Метод: crm.lead.add
 *
 * Если BITRIX24_WEBHOOK_URL не задан — возвращает ok: false, reason: "no-webhook".
 * Если webhook лежит — лог + ok: false. В обоих случаях лид всё равно сохраняется в БД.
 */
export async function sendLeadToBitrix24(lead: CrmLead): Promise<CrmResult> {
  const webhook = process.env.BITRIX24_WEBHOOK_URL?.replace(/\/+$/, "");
  if (!webhook) return { ok: false, reason: "no-webhook" };

  const fields: Record<string, unknown> = {
    TITLE: `[${lead.source}] ${lead.companyName || lead.name}`,
    NAME: lead.name,
    SOURCE_ID: mapSource(lead.source),
    PHONE: [{ VALUE: lead.phone, VALUE_TYPE: "WORK" }],
    COMMENTS: buildComment(lead),
  };
  if (lead.email) fields.EMAIL = [{ VALUE: lead.email, VALUE_TYPE: "WORK" }];
  if (lead.companyName) fields.COMPANY_TITLE = lead.companyName;
  if (lead.inn) fields.UF_CRM_INN = lead.inn; // кастомное поле; имя зависит от настройки портала

  try {
    const res = await fetch(`${webhook}/crm.lead.add.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields, params: { REGISTER_SONET_EVENT: "Y" } }),
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) {
      console.warn("bitrix24 non-2xx", res.status);
      return { ok: false, reason: `http-${res.status}` };
    }
    const data = (await res.json()) as { result?: number; error?: string };
    if (typeof data.result === "number") {
      return { ok: true, externalId: String(data.result) };
    }
    return { ok: false, reason: data.error || "unknown" };
  } catch (e) {
    console.warn("bitrix24 send error", e);
    return { ok: false, reason: "network-error" };
  }
}

function mapSource(source: string): string {
  switch (source) {
    case "callback":
      return "CALLBACK";
    case "tariff":
      return "WEB";
    case "contact":
      return "WEBFORM";
    case "calculator":
      return "WEB";
    default:
      return "OTHER";
  }
}

function buildComment(lead: CrmLead): string {
  const parts: string[] = [];
  if (lead.tariffSlug) parts.push(`Тариф: ${lead.tariffSlug}`);
  if (lead.inn) parts.push(`ИНН: ${lead.inn}`);
  if (lead.companyName) parts.push(`Компания: ${lead.companyName}`);
  if (lead.message) parts.push(`Сообщение:\n${lead.message}`);
  parts.push(`Источник: ${lead.source}`);
  return parts.join("\n\n");
}
