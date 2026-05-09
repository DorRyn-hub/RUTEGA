import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminListTariffs, adminCreateTariff } from "@/lib/admin/repos";
import { tariffCreateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, serverError } from "@/lib/api/respond";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const tariffs = await adminListTariffs();
  return NextResponse.json({ tariffs });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const input = tariffCreateSchema.parse(await req.json());
    const tariff = await adminCreateTariff(input);
    return NextResponse.json({ tariff }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Slug уже используется", { slug: "Slug уже занят" });
    }
    console.error("admin create tariff", err);
    return serverError();
  }
}
