import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminGetNews, adminUpdateNews, adminDeleteNews } from "@/lib/admin/repos";
import { newsUpdateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const item = await adminGetNews(id);
  if (!item) return notFound();
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = newsUpdateSchema.parse(await req.json());
    const item = await adminUpdateNews(id, input);
    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Slug уже используется", { slug: "Slug уже занят" });
    }
    console.error("admin update news", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteNews(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete news", err);
    return serverError();
  }
}
