import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { COOKIE_NAMES } from "@/constants/cookies";
import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  ROUTES,
} from "@/constants/routes";

const ADMIN_PREFIX = "/admin";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

function decodeJwtRole(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { role?: Role };
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const isAuthenticated = Boolean(accessToken);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if (pathname.startsWith(ADMIN_PREFIX) && accessToken) {
    const role = decodeJwtRole(accessToken);
    const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
    if (!isAdmin) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
