import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const result = await djangoFetch(`/memory-bank/circles/${id}/memories/`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}

export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const body = await readJson(req);
  const zone = req.headers.get("x-timezone");
  const result = await djangoFetch(`/memory-bank/circles/${id}/memories/`, {
    method: "POST",
    body,
    accessToken,
    headers: zone ? { "X-Timezone": zone } : undefined,
  });
  return forward(result);
}
