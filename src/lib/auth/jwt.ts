import { SignJWT, jwtVerify } from "jose";

const ISSUER = "rutega-website";
const AUDIENCE = "rutega-users";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("JWT_SECRET is not set or shorter than 32 characters");
  }
  return new TextEncoder().encode(raw);
}

export interface SessionPayload {
  sub: string;
  email: string;
  role?: string;
}

export async function signSession(payload: SessionPayload, ttlSeconds = 7 * 24 * 60 * 60) {
  const claims: Record<string, unknown> = { email: payload.email };
  if (payload.role) claims.role = payload.role;
  return new SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    const role = typeof payload.role === "string" ? payload.role : undefined;
    return { sub: payload.sub, email: payload.email, role };
  } catch {
    return null;
  }
}
