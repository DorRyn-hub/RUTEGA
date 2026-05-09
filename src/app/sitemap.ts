import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";
import { getAllCases, getAllNews, getAllServices } from "@/lib/repos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  // /thanks намеренно не включаем в sitemap (страница после конверсии).
  const staticPaths = [
    "/",
    "/services",
    "/services/b2g",
    "/tariffs",
    "/business",
    "/cases",
    "/coverage",
    "/technologies",
    "/about/team",
    "/about/licenses",
    "/about/requisites",
    "/news",
    "/support",
    "/contacts",
    "/legal/privacy",
    "/legal/consent",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.7,
  }));

  const [services, news, cases] = await Promise.all([
    getAllServices(),
    getAllNews(),
    getAllCases(),
  ]);

  return [
    ...staticPaths,
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...cases.map((c) => ({
      url: `${base}/cases/${c.slug}`,
      lastModified: new Date(c.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...news.map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
