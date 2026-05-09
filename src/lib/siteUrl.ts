export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
