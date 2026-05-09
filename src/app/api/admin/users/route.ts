import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminListUsers } from "@/lib/admin/repos";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const users = await adminListUsers();
  return NextResponse.json({ users });
}
