import "server-only";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/parseJson";
import type {
  ServiceDTO,
  TariffDTO,
  NewsItemDTO,
  BillDTO,
  UserServiceDTO,
  ServiceCategory,
  CaseDTO,
  CaseMetric,
  CoveragePointDTO,
  CoverageType,
  CoverageFeatureCollection,
} from "@/types/domain";

const KNOWN_CATEGORIES: ServiceCategory[] = [
  "internet",
  "transit",
  "vpn",
  "dedicated",
  "wifi",
  "security",
];

function asCategory(value: string): ServiceCategory {
  return (KNOWN_CATEGORIES as string[]).includes(value)
    ? (value as ServiceCategory)
    : "internet";
}

function toTariff(row: {
  id: string;
  slug: string;
  serviceId: string;
  title: string;
  speedMbps: number | null;
  priceRub: number;
  perks: string;
  highlight: boolean;
  order: number;
  service?: { slug: string };
}): TariffDTO {
  return {
    id: row.id,
    slug: row.slug,
    serviceSlug: row.service?.slug ?? "",
    title: row.title,
    speedMbps: row.speedMbps,
    priceRub: row.priceRub,
    perks: parseJsonArray(row.perks),
    highlight: row.highlight,
    order: row.order,
  };
}

export async function getAllServices(): Promise<ServiceDTO[]> {
  const rows = await prisma.service.findMany({
    orderBy: { order: "asc" },
    include: {
      tariffs: {
        orderBy: { order: "asc" },
        include: { service: { select: { slug: true } } },
      },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: asCategory(row.category),
    shortText: row.shortText,
    description: row.description,
    iconKey: row.iconKey,
    features: parseJsonArray(row.features),
    slaUptime: row.slaUptime,
    slaResponseHours: row.slaResponseHours,
    slaResolveHours: row.slaResolveHours,
    order: row.order,
    tariffs: row.tariffs.map(toTariff),
  }));
}

export async function getServiceBySlug(slug: string): Promise<ServiceDTO | null> {
  const row = await prisma.service.findUnique({
    where: { slug },
    include: {
      tariffs: {
        orderBy: { order: "asc" },
        include: { service: { select: { slug: true } } },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: asCategory(row.category),
    shortText: row.shortText,
    description: row.description,
    iconKey: row.iconKey,
    features: parseJsonArray(row.features),
    slaUptime: row.slaUptime,
    slaResponseHours: row.slaResponseHours,
    slaResolveHours: row.slaResolveHours,
    order: row.order,
    tariffs: row.tariffs.map(toTariff),
  };
}

export async function getAllTariffs(): Promise<TariffDTO[]> {
  const rows = await prisma.tariff.findMany({
    orderBy: [{ service: { order: "asc" } }, { order: "asc" }],
    include: { service: { select: { slug: true } } },
  });
  return rows.map(toTariff);
}

export async function getHighlightedTariffs(limit = 3): Promise<TariffDTO[]> {
  const rows = await prisma.tariff.findMany({
    where: { highlight: true },
    orderBy: { order: "asc" },
    take: limit,
    include: { service: { select: { slug: true } } },
  });
  return rows.map(toTariff);
}

export async function getAllNews(): Promise<NewsItemDTO[]> {
  const rows = await prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    publishedAt: n.publishedAt.toISOString(),
    cover: n.cover,
  }));
}

export async function getNewsBySlug(slug: string): Promise<NewsItemDTO | null> {
  const n = await prisma.newsItem.findUnique({ where: { slug } });
  if (!n) return null;
  return {
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    publishedAt: n.publishedAt.toISOString(),
    cover: n.cover,
  };
}

export async function getUserBills(userId: string): Promise<BillDTO[]> {
  const rows = await prisma.bill.findMany({
    where: { userId },
    orderBy: [{ period: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((b) => ({
    id: b.id,
    amount: b.amount,
    status: b.status as BillDTO["status"],
    period: b.period,
    paidAt: b.paidAt ? b.paidAt.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
  }));
}

function parseCaseMetrics(raw: string): CaseMetric[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (m) =>
          m && typeof m === "object" &&
          typeof (m as { label?: unknown }).label === "string" &&
          typeof (m as { value?: unknown }).value === "string",
      )
    ) {
      return parsed as CaseMetric[];
    }
    return [];
  } catch {
    return [];
  }
}

function asSegment(value: string): "b2b" | "b2g" {
  return value === "b2g" ? "b2g" : "b2b";
}

function toCase(row: {
  id: string;
  slug: string;
  clientName: string;
  clientLogoUrl: string | null;
  industry: string;
  segment: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  techStack: string;
  metrics: string;
  publishedAt: Date;
  cover: string | null;
  order: number;
}): CaseDTO {
  return {
    id: row.id,
    slug: row.slug,
    clientName: row.clientName,
    clientLogoUrl: row.clientLogoUrl,
    industry: row.industry,
    segment: asSegment(row.segment),
    summary: row.summary,
    challenge: row.challenge,
    solution: row.solution,
    result: row.result,
    techStack: parseJsonArray(row.techStack),
    metrics: parseCaseMetrics(row.metrics),
    publishedAt: row.publishedAt.toISOString(),
    cover: row.cover,
    order: row.order,
  };
}

export async function getAllCases(): Promise<CaseDTO[]> {
  const rows = await prisma.case.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
  });
  return rows.map(toCase);
}

export async function getCaseBySlug(slug: string): Promise<CaseDTO | null> {
  const row = await prisma.case.findUnique({ where: { slug } });
  if (!row || !row.isPublished) return null;
  return toCase(row);
}

function asCoverageType(value: string): CoverageType {
  return value === "optic" || value === "radio" || value === "pop" ? value : "pop";
}

function parseJsonObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function parseGeoJson(raw: string | null): unknown | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getAllCoveragePoints(): Promise<CoveragePointDTO[]> {
  const rows = await prisma.coveragePoint.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    type: asCoverageType(r.type),
    title: r.title,
    lat: r.lat,
    lng: r.lng,
    geojson: parseGeoJson(r.geojson),
    metadata: parseJsonObject(r.metadata),
  }));
}

export async function getCoverageGeoJson(): Promise<CoverageFeatureCollection> {
  const points = await getAllCoveragePoints();
  return {
    type: "FeatureCollection",
    features: points.map((p) => {
      const geometry =
        p.geojson && typeof p.geojson === "object" && "geometry" in (p.geojson as object)
          ? ((p.geojson as { geometry: { type: string; coordinates: unknown } }).geometry)
          : p.lat !== null && p.lng !== null
            ? { type: "Point" as const, coordinates: [p.lng, p.lat] as [number, number] }
            : { type: "Point" as const, coordinates: [0, 0] as [number, number] };
      return {
        type: "Feature" as const,
        id: p.id,
        geometry,
        properties: {
          type: p.type,
          title: p.title,
          metadata: p.metadata,
        },
      };
    }),
  };
}

export async function getUserServices(userId: string): Promise<UserServiceDTO[]> {
  const rows = await prisma.userService.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
    include: { service: { select: { slug: true, title: true } } },
  });

  const tariffSlugs = Array.from(new Set(rows.map((r) => r.tariffSlug)));
  const tariffs = await prisma.tariff.findMany({
    where: { slug: { in: tariffSlugs } },
    select: { slug: true, title: true, priceRub: true },
  });
  const tariffMap = new Map(tariffs.map((t) => [t.slug, t]));

  return rows.map((r) => {
    const tariff = tariffMap.get(r.tariffSlug);
    return {
      id: r.id,
      serviceSlug: r.service.slug,
      serviceTitle: r.service.title,
      tariffSlug: r.tariffSlug,
      tariffTitle: tariff?.title ?? r.tariffSlug,
      priceRub: tariff?.priceRub ?? 0,
      status: r.status as UserServiceDTO["status"],
      startedAt: r.startedAt.toISOString(),
    };
  });
}
