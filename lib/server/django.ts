import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { COOKIE_NAMES } from "@/constants/cookies";

/**
 * Server-only bridge to the Django API. The browser never talks to Django
 * directly — it calls the same-origin `/api/auth/*` route handlers, which use
 * these helpers to forward requests to Django and translate Django's
 * bearer-tokens-in-body into httpOnly cookies (and back).
 *
 * `NEXT_PUBLIC_API_URL` already points at the Django API root (e.g.
 * `http://localhost:8000/api/v1`). Django requires trailing slashes, so every
 * path passed here must end with one.
 */
const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const isProd = process.env.NODE_ENV === "production";

// Cookie lifetimes mirror the backend JWT defaults (access 60m, refresh 7d).
// The access cookie may expire before the refresh cookie; that is fine — the
// browser api client transparently rotates it via `/api/auth/refresh`.
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

export interface DjangoResult {
  status: number;
  /** Parsed JSON body, or null when Django returned no content. */
  body: unknown;
}

/** Call a Django endpoint with a JSON body. `path` must include a trailing slash. */
export async function djangoFetch(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    accessToken?: string;
  } = {},
): Promise<DjangoResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (init.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }

  const res = await fetch(`${DJANGO_BASE}${path}`, {
    method: init.method ?? "POST",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { detail: text };
    }
  }

  return { status: res.status, body };
}

export function getAccessToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
}

export function getRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
}

/** Mirror a Django response (status + body) straight back to the browser. */
export function forward(result: DjangoResult): NextResponse {
  if (result.body === null) {
    return new NextResponse(null, { status: result.status });
  }
  return NextResponse.json(result.body, { status: result.status });
}

/** Attach freshly issued JWTs as httpOnly cookies on a response. */
export function setAuthCookies(
  response: NextResponse,
  tokens: { access?: string; refresh?: string },
): NextResponse {
  if (tokens.access) {
    response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.access, {
      ...baseCookieOptions,
      maxAge: ACCESS_MAX_AGE,
    });
  }
  if (tokens.refresh) {
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh, {
      ...baseCookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
  }
  return response;
}

/** Clear both auth cookies (logout / failed refresh). */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
  return response;
}

interface TokenPayload {
  access?: string;
  refresh?: string;
  user?: unknown;
}

/**
 * Turn a Django token response (`{access, refresh, user}`) into a browser
 * response: on success, set the httpOnly auth cookies and return `{user}`;
 * otherwise forward Django's error verbatim.
 */
export function sessionResponse(result: DjangoResult): NextResponse {
  if (result.status >= 200 && result.status < 300) {
    const payload = (result.body ?? {}) as TokenPayload;
    const response = NextResponse.json({ user: payload.user ?? null });
    return setAuthCookies(response, {
      access: payload.access,
      refresh: payload.refresh,
    });
  }
  return forward(result);
}

export function jsonError(
  status: number,
  detail: string,
  code = "error",
): NextResponse {
  return NextResponse.json({ detail, code }, { status });
}

/** Safely read a JSON request body, returning {} on empty/invalid input. */
export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const text = await req.text();
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
