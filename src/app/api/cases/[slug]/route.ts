import { NextResponse } from "next/server";
import { getCaseBySlug } from "@/lib/repos";

export const revalidate = 600;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const c = await getCaseBySlug(slug);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ case: c });
}
