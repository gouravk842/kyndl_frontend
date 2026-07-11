import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Read the viewer's per-(category, channel) opt-outs.
export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const result = await djangoFetch("/notifications/preferences/", { method: "GET", accessToken });
  return forward(result);
}

// Update one preference.
export async function PATCH(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const body = await readJson(req);
  const result = await djangoFetch("/notifications/preferences/", { method: "PATCH", body, accessToken });
  return forward(result);
}
