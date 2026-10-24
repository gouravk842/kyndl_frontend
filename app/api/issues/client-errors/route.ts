import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

/**
 * Forward a browser crash to Django's issues ingest. Always 202 — recording
 * must never surface as another error to ``reportError``.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    await djangoFetch("/issues/client-errors/", {
      method: "POST",
      body,
      accessToken: getAccessToken(req),
    });
  } catch {
    // Swallow — never fail a crash ingest call.
  }
  return new NextResponse(null, { status: 202 });
}
