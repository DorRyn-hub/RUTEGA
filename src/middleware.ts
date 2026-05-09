import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/jwt";
import { DEMO_COOKIE, isDemoGateEnabled, verifyDemoToken } from "@/lib/auth/demoGate";

const PUBLIC_LK_PATHS = new Set(["/lk/login", "/lk/register"]);
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticPath(pathname)) return NextResponse.next();

  // 1. Demo gate (covers everything except gate page itself)
  if (isDemoGateEnabled()) {
    const isGatePath =
      pathname === "/demo-access" ||
      pathname.startsWith("/demo-access/") ||
      pathname === "/api/demo-access";
    if (!isGatePath) {
      const demoToken = req.cookies.get(DEMO_COOKIE)?.value;
      const demoOk = demoToken ? await verifyDemoToken(demoToken) : false;
      if (!demoOk) {
        const url = req.nextUrl.clone();
        url.pathname = "/demo-access";
        url.search = "";
        url.searchParams.set("from", pathname + (req.nextUrl.search || ""));
        return NextResponse.redirect(url);
      }
    }
  }

  // 2. Admin gate
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;

    if (PUBLIC_ADMIN_PATHS.has(pathname)) {
      if (session?.role === "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/lk";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. LK gate
  if (pathname.startsWith("/lk")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const valid = token ? await verifySession(token) : null;
    if (PUBLIC_LK_PATHS.has(pathname)) {
      if (valid) {
        const url = req.nextUrl.clone();
        url.pathname = "/lk";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/lk/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon|robots.txt|sitemap.xml).*)"],
};
