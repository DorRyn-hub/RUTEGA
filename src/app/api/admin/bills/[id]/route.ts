import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminGetBill, adminUpdateBill, adminDeleteBill } from "@/lib/admin/repos";
import { billUpdateSchema } from "@/lib/validation/admin";
import { fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const bill = await adminGetBill(id);
  if (!bill) return notFound();
  return NextResponse.json({ bill });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = billUpdateSchema.parse(await req.json());
    const bill = await adminUpdateBill(id, input);
    return NextResponse.json({ bill });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    console.error("admin update bill", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteBill(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete bill", err);
    return serverError();
  }
}
