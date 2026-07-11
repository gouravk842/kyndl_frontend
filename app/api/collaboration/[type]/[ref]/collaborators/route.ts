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

type Context = { params: Promise<{ type: string; ref: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// The roster + pending invites + viewer standing (manage-only on Django).
export async function GET(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref } = await ctx.params;
  const result = await djangoFetch(
    `/collaboration/${type}/${encodeURIComponent(ref)}/collaborators/`,
    { method: "GET", accessToken },
  );
  return forward(result);
}

// Invite a collaborator: { email, role }.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { type, ref } = await ctx.params;
  const body = await readJson(req);
  const result = await djangoFetch(
    `/collaboration/${type}/${encodeURIComponent(ref)}/collaborators/`,
    { method: "POST", body, accessToken },
  );
  return forward(result);
}
