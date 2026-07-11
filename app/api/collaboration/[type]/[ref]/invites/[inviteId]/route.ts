import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ type: string; ref: string; inviteId: string }>;
};

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Withdraw a still-pending invitation.
export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref, inviteId } = await ctx.params;
  const result = await djangoFetch(
    `/collaboration/${type}/${encodeURIComponent(ref)}/invites/${inviteId}/`,
    { method: "DELETE", accessToken },
  );
  return forward(result);
}
