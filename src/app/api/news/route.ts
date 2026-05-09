import { NextResponse } from "next/server";
import { getAllNews } from "@/lib/repos";

export async function GET() {
  const news = await getAllNews();
  return NextResponse.json({ news });
}
