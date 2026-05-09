import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import {
  adminGetService,
  adminUpdateService,
  adminDeleteService,
} from "@/lib/admin/repos";
import { serviceUpdateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const service = await adminGetService(id);
  if (!service) return notFound();
  return NextResponse.json({ service });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = serviceUpdateSchema.parse(await req.json());
    const service = await adminUpdateService(id, input);
    return NextResponse.json({ service });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Slug уже используется", { slug: "Slug уже занят" });
    }
    console.error("admin update service", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteService(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.toLowerCase().includes("foreign key")) {
      return badRequest(
        "Невозможно удалить: на услугу ссылаются другие данные.",
      );
    }
    console.error("admin delete service", err);
    return serverError();
  }
}
