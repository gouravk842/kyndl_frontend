import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Clear the badge: mark everything seen (not read).
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const result = await djangoFetch("/notifications/seen/", { method: "POST", body: {}, accessToken });
  return forward(result);
}
