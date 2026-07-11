import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// Report a message for moderator review.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { id } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/conversations/message/${id}/report/`, {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
