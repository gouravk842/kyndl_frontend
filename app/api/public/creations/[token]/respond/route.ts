import type { NextRequest } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

// Reads the (optional) auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

// Audience-facing response to a shared Moment (proposal / date-ask). No login is
// required for PUBLIC moments; for INVITE-only ones the viewer's access token is
// forwarded so Django can match their email. Django's 400/403/404 pass through
// verbatim.
export async function POST(req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const body = await readJson(req);
  const accessToken = getAccessToken(req);
  const result = await djangoFetch(`/public/creations/${token}/respond/`, {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
