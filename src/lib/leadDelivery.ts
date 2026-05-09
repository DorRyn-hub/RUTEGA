import "server-only";
import { prisma } from "@/lib/prisma";
import { sendLeadToBitrix24, type CrmLead } from "@/lib/crm/bitrix24";
import { sendAdminAlert } from "@/lib/email/unisender";

export interface DeliverInput extends CrmLead {
  consentMarketing?: boolean;
}

/**
 * Сохраняет лид в БД, шлёт его в CRM и в админ-почту параллельно.
 * Если внешние сервисы лежат — лид всё равно попадает в БД и в /admin/leads.
 */
export async function deliverLead(lead: DeliverInput): Promise<{ leadId: string }> {
  const created = await prisma.lead.create({
    data: {
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? null,
      message: lead.message ?? null,
      source: lead.source,
      tariffSlug: lead.tariffSlug ?? null,
      inn: lead.inn ?? null,
      companyName: lead.companyName ?? null,
      consentMarketing: lead.consentMarketing ?? false,
    },
  });

  // Параллельная отправка в CRM и email — не падаем, если что-то упало.
  const [crm, email] = await Promise.allSettled([
    sendLeadToBitrix24(lead),
    sendAdminAlert(lead),
  ]);

  if (crm.status === "fulfilled" && crm.value.ok && crm.value.externalId) {
    await prisma.lead.update({
      where: { id: created.id },
      data: { crmExternalId: crm.value.externalId, crmSyncedAt: new Date() },
    });
  } else if (crm.status === "fulfilled" && !crm.value.ok) {
    console.warn("[leadDelivery] CRM not synced:", crm.value.reason);
  } else if (crm.status === "rejected") {
    console.warn("[leadDelivery] CRM exception:", crm.reason);
  }

  if (email.status === "fulfilled" && !email.value.ok) {
    console.warn("[leadDelivery] admin email skipped:", email.value.reason);
  } else if (email.status === "rejected") {
    console.warn("[leadDelivery] admin email exception:", email.reason);
  }

  return { leadId: created.id };
}
