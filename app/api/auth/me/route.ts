import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache this.
export const dynamic = "force-dynamic";

// Returns the current user. A missing/expired access cookie yields 401, which
// the browser api client handles by calling /api/auth/refresh and retrying.
export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }

  const result = await djangoFetch("/auth/me/", {
    method: "GET",
    accessToken,
  });

  if (result.status >= 200 && result.status < 300) {
    return NextResponse.json({ user: result.body });
  }
  return forward(result);
}
