import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminApi } from "@/lib/admin/guard";
import { adminListBills, adminCreateBill } from "@/lib/admin/repos";
import { billCreateSchema } from "@/lib/validation/admin";
import { fromZod, serverError } from "@/lib/api/respond";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const bills = await adminListBills();
  return NextResponse.json({ bills });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const input = billCreateSchema.parse(await req.json());
    const bill = await adminCreateBill(input);
    return NextResponse.json({ bill }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return fromZod(err);
    console.error("admin create bill", err);
    return serverError();
  }
}
