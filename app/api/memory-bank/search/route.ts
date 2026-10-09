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
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const result = await djangoFetch(
    `/memory-bank/search/?q=${encodeURIComponent(q)}`,
    { method: "GET", accessToken },
  );
  return forward(result);
}
