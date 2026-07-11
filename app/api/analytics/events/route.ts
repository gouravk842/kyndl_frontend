import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, getAccessToken, readJson } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

/**
 * Forward a client analytics event to Django's ingest endpoint. Auth is
 * optional: anonymous visitors are tracked too (Django attributes the event to
 * the supplied `anonymous_id`), and a signed-in user's access cookie is
 * forwarded as a bearer token so the event is attributed to them.
 *
 * Always returns 202 to the browser — analytics is fire-and-forget, so a
 * Django hiccup must never bubble up to the client tracker as an error.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const accessToken = getAccessToken(req);
    await djangoFetch("/analytics/events/", {
      method: "POST",
      body,
      accessToken,
    });
  } catch {
    // Swallow — never fail a tracking call.
  }
  return new NextResponse(null, { status: 202 });
}
