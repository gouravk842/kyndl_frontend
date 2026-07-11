import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// Delete the signed-in user's own review. `mine` is a static segment so it
// wins over the `[type]/[ref]` dynamic route at the same depth.
export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { id } = await ctx.params;
  const result = await djangoFetch(`/reviews/mine/${id}/`, {
    method: "DELETE",
    accessToken,
  });
  return forward(result);
}
