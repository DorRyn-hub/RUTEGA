import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/audit/log";
import { badRequest } from "@/lib/api/respond";

const createSchema = z.object({
  slug: z.string().min(2).max(60),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  group: z.string().max(60).optional(),
  order: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Заполните slug и название");
  const created = await prisma.statusComponent.create({
    data: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      group: parsed.data.group ?? null,
      order: parsed.data.order ?? 0,
    },
  });
  await recordAudit({
    actorId: admin.id,
    action: "status.component.create",
    targetType: "StatusComponent",
    targetId: created.id,
    payload: { slug: parsed.data.slug },
  });
  return NextResponse.json({ component: created });
}
