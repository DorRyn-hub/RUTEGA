import { NextRequest, NextResponse } from "next/server";
import { authV1 } from "@/lib/api/v1Auth";
import { listIncidents } from "@/lib/sla/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authV1(req, "read");
  if (!auth.ok) return auth.res;
  const open = await listIncidents({ open: true, limit: 30 });
  const recent = await listIncidents({ open: false, limit: 30 });
  return NextResponse.json({ open, recent });
}
