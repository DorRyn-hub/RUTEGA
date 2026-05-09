import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/respond";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ user });
}
