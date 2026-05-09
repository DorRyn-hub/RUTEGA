import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionCookie } from "./cookies";
import { verifySession } from "./jwt";
import type { UserDTO } from "@/types/domain";

export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  const token = await readSessionCookie();
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      username: true,
      role: true,
      status: true,
    },
  });
  if (!user || user.status === "banned") return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    username: user.username,
    role: user.role,
  };
});

export async function getAdminUser(): Promise<UserDTO | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireAdmin(): Promise<UserDTO> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/lk");
  return user;
}
