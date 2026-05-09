import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized, forbidden } from "@/lib/api/respond";

export async function requireAdminApi(): Promise<
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: unauthorized() };
  if (user.role !== "admin") return { ok: false, response: forbidden() };
  return { ok: true, user };
}
