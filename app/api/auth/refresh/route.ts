import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  djangoFetch,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/server/django";

// Rotates the access cookie (and refresh, since the backend rotates refresh
// tokens) using the httpOnly refresh cookie. The browser never sees the tokens.
export async function POST(req: NextRequest) {
  const refresh = getRefreshToken(req);
  if (!refresh) {
    return clearAuthCookies(
      NextResponse.json(
        { detail: "No active session.", code: "no_session" },
        { status: 401 },
      ),
    );
  }

  const result = await djangoFetch("/auth/token/refresh/", {
    body: { refresh },
  });

  if (result.status < 200 || result.status >= 300) {
    return clearAuthCookies(
      NextResponse.json(
        { detail: "Session expired.", code: "session_expired" },
        { status: 401 },
      ),
    );
  }

  const payload = (result.body ?? {}) as { access?: string; refresh?: string };
  return setAuthCookies(NextResponse.json({ ok: true }), {
    access: payload.access,
    // Falls back to the existing refresh cookie when rotation is disabled.
    refresh: payload.refresh ?? refresh,
  });
}
