import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const result = await djangoFetch(`/expenses/shop/${id}/`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { id } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/expenses/shop/${id}/`, {
    method: "PATCH",
    body,
    accessToken,
  });
  return forward(result);
}
