import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireOrgPermission } from "@/lib/org/context";
import { createConnectionRequest } from "@/lib/connection/engine";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({
  contactName: z.string().min(2).max(120),
  contactPhone: z.string().min(5).max(40),
  contactEmail: z.string().email().optional(),
  address: z.string().min(3).max(500),
  lat: z.number().optional(),
  lng: z.number().optional(),
  serviceType: z.enum(["internet", "l2vpn", "mpls", "hosting", "colocation", "other"]),
  speedMbps: z.number().int().positive().max(100000).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const ctx = await requireOrgPermission("connection.write");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Заполните контакт и адрес");
  const created = await createConnectionRequest({
    organizationId: ctx.org.id,
    inn: ctx.org.inn,
    legalName: ctx.org.legalName,
    actorId: user.id,
    ...parsed.data,
  });
  return NextResponse.json({ request: { id: created.id } });
}
