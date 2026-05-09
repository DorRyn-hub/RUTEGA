import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveOrgContext } from "@/lib/org/context";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import { badRequest, unauthorized } from "@/lib/api/respond";

const schema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Оценка должна быть от 0 до 10");
  const ctx = await getActiveOrgContext();
  await prisma.npsResponse.create({
    data: {
      organizationId: ctx?.org.id ?? null,
      userId: user.id,
      score: parsed.data.score,
      comment: parsed.data.comment ?? null,
    },
  });
  await recordAudit({
    actorId: user.id,
    organizationId: ctx?.org.id ?? null,
    action: "nps.submit",
    payload: { score: parsed.data.score },
  });
  return NextResponse.json({ ok: true });
}
