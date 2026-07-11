import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ type: string; ref: string }> };

// Whether the signed-in user may review this target.
export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { type, ref } = await ctx.params;
  const result = await djangoFetch(
    `/reviews/${type}/${encodeURIComponent(ref)}/eligibility/`,
    { method: "GET", accessToken },
  );
  return forward(result);
}
