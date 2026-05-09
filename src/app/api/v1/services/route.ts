import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/parseJson";
import { authV1 } from "@/lib/api/v1Auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await authV1(req, "read");
  if (!auth.ok) return auth.res;
  const services = await prisma.userService.findMany({
    where: { user: { memberships: { some: { organizationId: auth.ctx.organizationId } } } },
    include: {
      service: { select: { slug: true, title: true, slaUptime: true } },
      site: { select: { id: true, title: true, address: true } },
    },
    orderBy: { startedAt: "asc" },
  });
  const tariffSlugs = Array.from(new Set(services.map((s) => s.tariffSlug)));
  const tariffs = tariffSlugs.length
    ? await prisma.tariff.findMany({
        where: { slug: { in: tariffSlugs } },
        select: { slug: true, title: true, priceRub: true, perks: true, speedMbps: true },
      })
    : [];
  const tariffMap = new Map(tariffs.map((t) => [t.slug, t]));
  return NextResponse.json({
    services: services.map((s) => {
      const t = tariffMap.get(s.tariffSlug);
      return {
        id: s.id,
        serviceSlug: s.service.slug,
        serviceTitle: s.service.title,
        slaUptime: s.service.slaUptime,
        tariffSlug: s.tariffSlug,
        tariffTitle: t?.title ?? s.tariffSlug,
        speedMbps: t?.speedMbps ?? null,
        priceRub: t?.priceRub ?? 0,
        perks: t?.perks ? parseJsonArray(t.perks) : [],
        site: s.site
          ? { id: s.site.id, title: s.site.title, address: s.site.address }
          : null,
        status: s.status,
        startedAt: s.startedAt.toISOString(),
      };
    }),
  });
}
