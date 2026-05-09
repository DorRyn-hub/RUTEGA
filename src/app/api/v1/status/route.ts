import { NextResponse } from "next/server";
import { listStatusComponents, listIncidents, getOverallStatus } from "@/lib/sla/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const [components, openIncidents, recent, overall] = await Promise.all([
    listStatusComponents(),
    listIncidents({ open: true, limit: 20 }),
    listIncidents({ open: false, limit: 20 }),
    getOverallStatus(),
  ]);
  return NextResponse.json({
    overall: { level: overall.level, label: overall.label },
    components,
    incidents: { active: openIncidents, recent },
    generatedAt: new Date().toISOString(),
  });
}
