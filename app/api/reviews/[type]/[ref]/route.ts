import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

// Dynamic route params are async in this Next version.
type Context = { params: Promise<{ type: string; ref: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Public list of a target's reviews + summary. The access token is forwarded
// when present so Django can also return the viewer's own review + eligibility;
// it stays readable when signed out.
export async function GET(req: NextRequest, ctx: Context) {
  const { type, ref } = await ctx.params;
  const qs = req.nextUrl.search; // e.g. "?limit=20&offset=20"
  const result = await djangoFetch(`/reviews/${type}/${encodeURIComponent(ref)}/${qs}`, {
    method: "GET",
    accessToken: getAccessToken(req),
  });
  return forward(result);
}

// Create or update the signed-in user's review of this target.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/reviews/${type}/${encodeURIComponent(ref)}/`, {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
