import { NextResponse } from "next/server";
import { getNewsBySlug } from "@/lib/repos";
import { notFound } from "@/lib/api/respond";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const item = await getNewsBySlug(slug);
  if (!item) return notFound();
  return NextResponse.json({ item });
}
