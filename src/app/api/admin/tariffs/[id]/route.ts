import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminGetTariff, adminUpdateTariff, adminDeleteTariff } from "@/lib/admin/repos";
import { tariffUpdateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const tariff = await adminGetTariff(id);
  if (!tariff) return notFound();
  return NextResponse.json({ tariff });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = tariffUpdateSchema.parse(await req.json());
    const tariff = await adminUpdateTariff(id, input);
    return NextResponse.json({ tariff });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Slug уже используется", { slug: "Slug уже занят" });
    }
    console.error("admin update tariff", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteTariff(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete tariff", err);
    return serverError();
  }
}
