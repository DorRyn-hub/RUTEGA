import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { startTwoFactorEnrollment } from "@/lib/auth/twoFactor";
import { unauthorized } from "@/lib/api/respond";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const enrollment = await startTwoFactorEnrollment(user.id, user.email);
  return NextResponse.json(enrollment);
}
