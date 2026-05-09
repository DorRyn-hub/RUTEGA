import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  attachQuote,
  calculateQuote,
  changeRequestStatus,
  recordSurvey,
} from "@/lib/connection/engine";
import { badRequest } from "@/lib/api/respond";

const schema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("survey"),
    availability: z.enum(["available", "partial", "unavailable"]),
    notes: z.string().max(2000).optional(),
  }),
  z.object({
    op: z.literal("quote"),
    serviceType: z.enum(["internet", "l2vpn", "mpls", "hosting", "colocation", "other"]),
    speedMbps: z.number().int().positive().optional(),
    distanceMeters: z.number().int().nonnegative().optional(),
  }),
  z.object({
    op: z.literal("status"),
    status: z.enum(["new", "survey", "quoted", "accepted", "rejected", "active"]),
  }),
]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Некорректный запрос");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Неверные данные");

  switch (parsed.data.op) {
    case "survey":
      await recordSurvey({
        requestId: id,
        availability: parsed.data.availability,
        notes: parsed.data.notes,
        actorId: admin.id,
      });
      break;
    case "quote": {
      const quote = calculateQuote({
        serviceType: parsed.data.serviceType,
        speedMbps: parsed.data.speedMbps,
        distanceMeters: parsed.data.distanceMeters,
      });
      await attachQuote(id, quote, admin.id);
      return NextResponse.json({ quote });
    }
    case "status":
      await changeRequestStatus(id, parsed.data.status, admin.id);
      break;
  }
  return NextResponse.json({ ok: true });
}
