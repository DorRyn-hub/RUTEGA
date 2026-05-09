import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { recordPayment, rubToKop } from "@/lib/billing/engine";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({
  amountRub: z.number().positive().max(50_000_000),
  invoiceId: z.string().optional(),
  method: z.enum(["bank_transfer", "card", "manual"]).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const ctx = await requireOrgPermission("billing.pay");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Сумма должна быть положительной");
  const payment = await recordPayment({
    organizationId: ctx.org.id,
    amountKop: rubToKop(parsed.data.amountRub),
    method: parsed.data.method ?? "card",
    invoiceId: parsed.data.invoiceId,
    note: parsed.data.note ?? "Оплата через ЛК (демо)",
    actorId: user.id,
  });
  return NextResponse.json({ payment: { id: payment.id } });
}
