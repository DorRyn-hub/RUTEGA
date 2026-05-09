import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import {
  adminListServices,
  adminCreateService,
} from "@/lib/admin/repos";
import { serviceCreateSchema } from "@/lib/validation/admin";
import { badRequest, fromZod, serverError } from "@/lib/api/respond";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const services = await adminListServices();
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const input = serviceCreateSchema.parse(await req.json());
    const service = await adminCreateService(input);
    return NextResponse.json({ service }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    if (err instanceof Error && err.message.includes("Unique")) {
      return badRequest("Slug уже используется", { slug: "Slug уже занят" });
    }
    console.error("admin create service", err);
    return serverError();
  }
}
