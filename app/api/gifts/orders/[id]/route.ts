import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// In this Next version, dynamic route params are async.
type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// One gift order the signed-in user owns.
export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await ctx.params;
  const result = await djangoFetch(`/gifts/orders/${id}/`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}
