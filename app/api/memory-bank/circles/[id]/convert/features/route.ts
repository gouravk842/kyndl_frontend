import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { id } = await ctx.params;
  const query = req.nextUrl.search;
  const result = await djangoFetch(
    `/memory-bank/circles/${id}/convert/features/${query}`,
    { method: "GET", accessToken },
  );
  return forward(result);
}
