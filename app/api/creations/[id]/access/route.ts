import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Set who can view a creation: { visibility, invites[] }.
export async function PATCH(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/creations/${id}/access/`, {
    method: "PATCH",
    body,
    accessToken,
  });
  return forward(result);
}
