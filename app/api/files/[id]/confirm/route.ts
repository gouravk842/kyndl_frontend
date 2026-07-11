import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

// In this Next version, dynamic route params are async.
type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Confirm a finished upload — promotes the file to UPLOADED so it can be
// referenced by a creation.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await ctx.params;
  const result = await djangoFetch(`/files/${id}/confirm/`, {
    method: "POST",
    accessToken,
  });
  return forward(result);
}
