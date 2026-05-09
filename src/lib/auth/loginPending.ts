import "server-only";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const PENDING_2FA_COOKIE = "rutega_login_pending";
const ISSUER = "rutega-website";
const AUDIENCE = "rutega-2fa";
const TTL_SECONDS = 5 * 60;

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("JWT_SECRET is not set or shorter than 32 characters");
  }
  return new TextEncoder().encode(raw);
}

async function isSecure(): Promise<boolean> {
  const h = await headers();
  const proto =
    h.get("x-forwarded-proto") ??
    (h.get("forwarded")?.match(/proto=([^;]+)/i)?.[1] ?? "");
  const host = h.get("host") ?? "";
  if (/^(localhost|127\.|\[::1\])/i.test(host)) return false;
  return proto.toLowerCase() === "https";
}

export async function issuePendingChallenge(userId: string): Promise<void> {
  const token = await new SignJWT({ p: "2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());
  const store = await cookies();
  store.set({
    name: PENDING_2FA_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: await isSecure(),
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function readPendingChallenge(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(PENDING_2FA_COOKIE)?.value;
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function clearPendingChallenge(): Promise<void> {
  const store = await cookies();
  store.set({ name: PENDING_2FA_COOKIE, value: "", maxAge: 0, path: "/" });
}
