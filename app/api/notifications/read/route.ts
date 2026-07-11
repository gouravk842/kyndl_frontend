import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Mark specific notifications read ({ids:[...]}) or all ({all:true}).
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const body = await readJson(req);
  const result = await djangoFetch("/notifications/read/", { method: "POST", body, accessToken });
  return forward(result);
}
