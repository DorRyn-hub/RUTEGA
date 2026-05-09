import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminGetLead, adminUpdateLead, adminDeleteLead } from "@/lib/admin/repos";
import { leadUpdateSchema } from "@/lib/validation/admin";
import { fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const lead = await adminGetLead(id);
  if (!lead) return notFound();
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = leadUpdateSchema.parse(await req.json());
    const lead = await adminUpdateLead(id, input);
    return NextResponse.json({ lead });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    console.error("admin update lead", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteLead(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete lead", err);
    return serverError();
  }
}
