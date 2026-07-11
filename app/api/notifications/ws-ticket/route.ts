import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Exchange the httpOnly access cookie for the short-lived signed ticket the
// browser passes on the notifications WebSocket (the socket is cross-origin and
// can't carry the cookie).
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const result = await djangoFetch("/notifications/ws-ticket/", {
    method: "POST",
    body: {},
    accessToken,
  });
  return forward(result);
}
