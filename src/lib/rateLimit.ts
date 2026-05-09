// Token-bucket per key (typically IP). In-memory — works for a single instance.
// TODO: replace with Redis/Upstash for horizontal scaling.

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  capacity: number;
  refillPerSecond: number;
}

export function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  const bucket: Bucket = existing
    ? { ...existing }
    : { tokens: options.capacity, updatedAt: now };
  const elapsedSeconds = (now - bucket.updatedAt) / 1000;
  bucket.tokens = Math.min(
    options.capacity,
    bucket.tokens + elapsedSeconds * options.refillPerSecond,
  );
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const deficit = 1 - bucket.tokens;
    const retryAfterMs = Math.ceil((deficit / options.refillPerSecond) * 1000);
    return { allowed: false, retryAfterMs };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfterMs: 0 };
}

export function clientKeyFromRequest(req: Request): string {
  // Next.js stores remote IP behind proxy headers; fall back to a constant
  // bucket key if the platform doesn't expose one.
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}
