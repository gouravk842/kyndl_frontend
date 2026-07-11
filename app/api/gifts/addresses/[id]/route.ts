import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

// In this Next version, dynamic route params are async.
type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function PATCH(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/gifts/addresses/${id}/`, { method: "PATCH", body, accessToken });
  return forward(result);
}

export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const result = await djangoFetch(`/gifts/addresses/${id}/`, { method: "DELETE", accessToken });
  return forward(result);
}
