import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/lib/repos";
import { notFound } from "@/lib/api/respond";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const service = await getServiceBySlug(slug);
  if (!service) return notFound();
  return NextResponse.json({ service });
}
