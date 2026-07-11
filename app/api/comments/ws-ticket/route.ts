import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Mint the short-lived signed ticket the browser passes on the WebSocket. The
// httpOnly access cookie can't be read by client JS and the socket is cross-
// origin, so this server route (which holds the cookie) exchanges it for a
// ticket Django's consumer verifies on connect.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated.", code: "not_authenticated" },
      { status: 401 },
    );
  }
  const result = await djangoFetch("/conversations/ws-ticket/", {
    method: "POST",
    body: {},
    accessToken,
  });
  return forward(result);
}
