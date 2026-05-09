import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/repos";

export async function GET() {
  const services = await getAllServices();
  return NextResponse.json({ services });
}
