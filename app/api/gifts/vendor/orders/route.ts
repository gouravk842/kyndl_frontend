import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Forwards any ?status= filter through to Django.
export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const result = await djangoFetch(`/gifts/vendor/orders/${req.nextUrl.search}`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}
