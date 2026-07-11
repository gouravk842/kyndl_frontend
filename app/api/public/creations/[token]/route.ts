import type { NextRequest } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the (optional) auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

// Audience-facing read of a shared creation by its public token. No login is
// required for PUBLIC creations; for INVITE-only ones we forward the viewer's
// access token (when signed in) so Django can match their email. Django's
// 403/404 is forwarded verbatim.
export async function GET(req: NextRequest, ctx: Context) {
  const { token } = await ctx.params;
  const accessToken = getAccessToken(req);
  const result = await djangoFetch(`/public/creations/${token}/`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}
