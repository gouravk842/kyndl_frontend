import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Publish a creation. Django returns 402 (with the product) for paid types that
// haven't been paid for yet; that status is forwarded verbatim so the client can
// launch checkout.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await ctx.params;
  const result = await djangoFetch(`/creations/${id}/publish/`, {
    method: "POST",
    accessToken,
  });
  return forward(result);
}
