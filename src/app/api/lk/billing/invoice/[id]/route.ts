import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { getRenderedInvoice } from "@/lib/billing/invoiceHtml";
import { unauthorized, notFound } from "@/lib/api/respond";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const orgCtx = await requireOrgPermission("billing.read");
  const { id } = await ctx.params;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { account: true } });
  if (!inv || inv.account.organizationId !== orgCtx.org.id) return notFound();
  const html = await getRenderedInvoice(id);
  if (!html) return notFound();
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
