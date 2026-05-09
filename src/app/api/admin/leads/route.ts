import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminListLeads } from "@/lib/admin/repos";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const leads = await adminListLeads();
  return NextResponse.json({ leads });
}
