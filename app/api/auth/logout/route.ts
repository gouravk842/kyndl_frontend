import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  djangoFetch,
  getAccessToken,
  getRefreshToken,
} from "@/lib/server/django";

// Best-effort blacklist of the refresh token on Django, then always clear the
// cookies so the browser session ends regardless of the backend's response.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  const refresh = getRefreshToken(req);

  if (refresh && accessToken) {
    try {
      await djangoFetch("/auth/logout/", {
        body: { refresh },
        accessToken,
      });
    } catch {
      // Ignore — local sign-out must succeed even if the backend call fails.
    }
  }

  return clearAuthCookies(NextResponse.json({ ok: true }));
}
