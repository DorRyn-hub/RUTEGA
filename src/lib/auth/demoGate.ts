import { SignJWT, jwtVerify } from "jose";

export const DEMO_COOKIE = "rutega_demo";
export const DEMO_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 дней

const ISSUER = "rutega-demo";
const AUDIENCE = "rutega-demo-gate";
const ALG = "HS256";

const DEFAULT_USER = "admin2222";
const DEFAULT_PASS = "karim22333";

function getSecret(): Uint8Array {
  const raw = process.env.DEMO_SECRET || process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("DEMO_SECRET or JWT_SECRET must be set (>= 32 chars)");
  }
  return new TextEncoder().encode(raw);
}

export function isDemoGateEnabled(): boolean {
  return process.env.DEMO_GATE_ENABLED !== "false";
}

export function getDemoCredentials(): { user: string; pass: string } {
  return {
    user: process.env.DEMO_USER || DEFAULT_USER,
    pass: process.env.DEMO_PASS || DEFAULT_PASS,
  };
}

export async function signDemoToken(): Promise<string> {
  return new SignJWT({ kind: "demo" })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${DEMO_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyDemoToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE });
    return true;
  } catch {
    return false;
  }
}
