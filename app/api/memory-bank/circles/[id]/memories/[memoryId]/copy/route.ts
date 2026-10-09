import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string; memoryId: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id, memoryId } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(
    `/memory-bank/circles/${id}/memories/${memoryId}/copy/`,
    { method: "POST", body, accessToken },
  );
  return forward(result);
}
