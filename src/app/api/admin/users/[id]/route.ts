import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminGetUser, adminUpdateUser, adminDeleteUser } from "@/lib/admin/repos";
import { userAdminUpdateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, notFound, serverError } from "@/lib/api/respond";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const user = await adminGetUser(id);
  if (!user) return notFound();
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const input = userAdminUpdateSchema.parse(await req.json());
    const user = await adminUpdateUser(id, input);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Email или логин уже используются");
    }
    console.error("admin update user", err);
    return serverError();
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  if (auth.user.id === id) return badRequest("Нельзя удалить самого себя");
  try {
    await adminDeleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin delete user", err);
    return serverError();
  }
}
