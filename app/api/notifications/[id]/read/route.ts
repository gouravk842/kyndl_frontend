import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Dynamic route params are async in this Next version.
type Context = { params: Promise<{ id: string }> };

// Mark one notification read (item click).
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const { id } = await ctx.params;
  const result = await djangoFetch(`/notifications/${encodeURIComponent(id)}/read/`, {
    method: "POST",
    body: {},
    accessToken,
  });
  return forward(result);
}
