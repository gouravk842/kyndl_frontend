import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// A page of the viewer's notifications + badge counts. Signed-in only.
export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const qs = req.nextUrl.search; // preserves ?limit / ?offset / ?unread / ?category
  const result = await djangoFetch(`/notifications/${qs}`, { method: "GET", accessToken });
  return forward(result);
}
