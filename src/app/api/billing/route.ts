import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserBills } from "@/lib/repos";
import { unauthorized } from "@/lib/api/respond";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const bills = await getUserBills(user.id);
  return NextResponse.json({ bills });
}
