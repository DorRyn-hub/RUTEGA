import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "rutega_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

async function isSecureRequest(): Promise<boolean> {
  const h = await headers();
  const proto =
    h.get("x-forwarded-proto") ??
    (h.get("forwarded")?.match(/proto=([^;]+)/i)?.[1] ?? "");
  const host = h.get("host") ?? "";
  const isLocalhost = /^(localhost|127\.|\[::1\])/i.test(host);
  if (isLocalhost) return false;
  return proto.toLowerCase() === "https";
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
