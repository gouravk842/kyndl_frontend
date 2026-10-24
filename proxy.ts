import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { COOKIE_NAMES } from "@/constants/cookies";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  ROUTES,
} from "@/constants/routes";
import { postAuthDestination } from "@/lib/navigation";

function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isBuilderPath(pathname)
  );
}

// Customising any experience requires an account: every builder lives at
// `/<experience>/build`. Gating it here (not per feature) keeps "no editing
// without login" a single rule — the marketing/demo pages stay public.
function isBuilderPath(pathname: string): boolean {
  return pathname.endsWith("/build");
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

// Optimistic, cookie-presence-only auth check (the recommended Proxy pattern —
// real authorization happens in the BFF/Django on every request).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  // Access tokens are short-lived. A present refresh token still means a live
  // session — the api client transparently rotates the access cookie on the
  // first 401 — so we must not bounce the user to login just because the access
  // cookie has expired.
  const isAuthenticated = Boolean(accessToken || refreshToken);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    // Preserve the full target (incl. `?id=` for editing) so login returns here.
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // A signed-in user has a dashboard, so the standalone `/<type>/build` builder is
  // never their surface — send them to the same builder embedded in the dashboard
  // shell (sidebar + header stay put). Editing (`?id=`) reopens that creation;
  // otherwise it's a fresh build (`?new=<type>`). Builders are login-only (gated
  // above), so in practice every real visit lands in the dashboard.
  if (isBuilderPath(pathname) && isAuthenticated) {
    const slug = pathname.split("/").filter(Boolean)[0];
    const id = request.nextUrl.searchParams.get("id");
    const target = new URL(ROUTES.dashboard, request.url);
    if (id) {
      target.searchParams.set("id", id);
      target.searchParams.set("edit", "1");
    } else if (slug) {
      target.searchParams.set("new", slug);
    }
    return NextResponse.redirect(target);
  }

  if (isAuthPath(pathname) && isAuthenticated) {
    // Honor `callbackUrl` so checkout (and other gated pages) resume after
    // login. Dropping it always sent people to the dashboard — and a cached
    // `/checkout` → `/login` redirect then looked like "stuck on login".
    const dest = postAuthDestination(
      request.nextUrl.searchParams.get("callbackUrl"),
    );
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Keep the readable signed-in marker in sync with httpOnly tokens so client
  // JS can skip `/api/auth/me` for anonymous visitors (and backfill the marker
  // for sessions established before the flag existed).
  const hasSignedInMarker = Boolean(
    request.cookies.get(COOKIE_NAMES.SIGNED_IN)?.value,
  );
  if (isAuthenticated && !hasSignedInMarker) {
    response.cookies.set(COOKIE_NAMES.SIGNED_IN, "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  } else if (!isAuthenticated && hasSignedInMarker) {
    response.cookies.set(COOKIE_NAMES.SIGNED_IN, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
