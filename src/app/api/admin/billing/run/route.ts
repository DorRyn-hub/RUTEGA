import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { runMonthlyBilling, runBillingForOrg, periodKey } from "@/lib/billing/engine";
import { recordAudit } from "@/lib/audit/log";
import { badRequest } from "@/lib/api/respond";

const schema = z.object({
  organizationId: z.string().optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Некорректный период");
  const period = parsed.data.period ?? periodKey(new Date());

  if (parsed.data.organizationId) {
    const result = await runBillingForOrg(parsed.data.organizationId, period);
    await recordAudit({
      actorId: admin.id,
      organizationId: parsed.data.organizationId,
      action: "billing.org.run",
      payload: { period, ...result },
    });
    return NextResponse.json(result);
  }
  const result = await runMonthlyBilling(period);
  return NextResponse.json(result);
}
