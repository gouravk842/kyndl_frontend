import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ surface: string; ref: string }> };

// Lock/unlock the thread (moderator only — Django enforces).
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { surface, ref } = await ctx.params;
  const qs = req.nextUrl.search;
  const body = await readJson(req);
  const result = await djangoFetch(
    `/conversations/${surface}/${encodeURIComponent(ref)}/lock/${qs}`,
    { method: "POST", body, accessToken },
  );
  return forward(result);
}
