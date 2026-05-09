import { NextRequest, NextResponse } from "next/server";
import { authV1 } from "@/lib/api/v1Auth";
import { getAccountSummary, listOrgInvoices } from "@/lib/billing/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authV1(req, "read");
  if (!auth.ok) return auth.res;
  const summary = await getAccountSummary(auth.ctx.organizationId);
  const invoices = await listOrgInvoices(auth.ctx.organizationId);
  return NextResponse.json({
    organizationId: auth.ctx.organizationId,
    account: summary,
    invoices,
  });
}
