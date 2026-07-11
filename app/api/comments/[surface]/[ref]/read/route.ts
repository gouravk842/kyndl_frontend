import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ surface: string; ref: string }> };

// Mark the thread caught-up for the signed-in viewer (clears unread).
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
  const result = await djangoFetch(
    `/conversations/${surface}/${encodeURIComponent(ref)}/read/${qs}`,
    { method: "POST", body: {}, accessToken },
  );
  return forward(result);
}
