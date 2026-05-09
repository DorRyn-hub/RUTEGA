import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { queryAuditLog } from "@/lib/audit/log";

export async function GET(req: NextRequest) {
  await requireAdmin();
  const url = new URL(req.url);
  const result = await queryAuditLog({
    organizationId: url.searchParams.get("org") ?? undefined,
    actorId: url.searchParams.get("actor") ?? undefined,
    action: url.searchParams.get("q") ?? undefined,
    page: Number(url.searchParams.get("page") ?? "1"),
    limit: Number(url.searchParams.get("limit") ?? "50"),
  });
  return NextResponse.json(result);
}
