import { NextResponse } from "next/server";
import { getAllCases } from "@/lib/repos";

export const revalidate = 600;

export async function GET() {
  const cases = await getAllCases();
  return NextResponse.json({ cases });
}
