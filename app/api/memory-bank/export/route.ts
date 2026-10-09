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

export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const circleId = req.nextUrl.searchParams.get("circle_id");
  const query = circleId ? `?circle_id=${encodeURIComponent(circleId)}` : "";
  const result = await djangoFetch(`/memory-bank/export/${query}`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}
