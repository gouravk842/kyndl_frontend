import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Accept an invitation as the signed-in (invited) user.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { token } = await ctx.params;
  const result = await djangoFetch(
    `/collaboration/invites/${encodeURIComponent(token)}/accept/`,
    { method: "POST", accessToken },
  );
  return forward(result);
}
