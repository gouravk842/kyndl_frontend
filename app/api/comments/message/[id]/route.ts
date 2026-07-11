import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Edit your own message.
export async function PATCH(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/conversations/message/${id}/`, {
    method: "PATCH",
    body,
    accessToken,
  });
  return forward(result);
}

// Soft-delete your own message (or hide it, if you moderate).
export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const result = await djangoFetch(`/conversations/message/${id}/`, {
    method: "DELETE",
    accessToken,
  });
  return forward(result);
}
