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

type Context = { params: Promise<{ type: string; ref: string; seatId: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Change a collaborator's role: { role }.
export async function PATCH(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref, seatId } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(
    `/collaboration/${type}/${encodeURIComponent(ref)}/collaborators/${seatId}/`,
    { method: "PATCH", body, accessToken },
  );
  return forward(result);
}

// Remove a collaborator's seat.
export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref, seatId } = await ctx.params;
  const result = await djangoFetch(
    `/collaboration/${type}/${encodeURIComponent(ref)}/collaborators/${seatId}/`,
    { method: "DELETE", accessToken },
  );
  return forward(result);
}
