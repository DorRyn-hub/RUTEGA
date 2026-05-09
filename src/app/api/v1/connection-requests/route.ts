import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authV1 } from "@/lib/api/v1Auth";
import { createConnectionRequest } from "@/lib/connection/engine";

export const dynamic = "force-dynamic";

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
  const auth = await authV1(req, "write");
  if (!auth.ok) return auth.res;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const created = await createConnectionRequest({
    organizationId: auth.ctx.organizationId,
    ...parsed.data,
  });
  return NextResponse.json({ request: { id: created.id, status: created.status } }, { status: 201 });
}
