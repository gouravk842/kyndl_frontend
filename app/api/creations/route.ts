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

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// List the user's creations (optionally `?type=scrapbook`).
export async function GET(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const type = req.nextUrl.searchParams.get("type");
  const path = type
    ? `/creations/?type=${encodeURIComponent(type)}`
    : "/creations/";

  const result = await djangoFetch(path, { method: "GET", accessToken });
  return forward(result);
}

// Create a new creation.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = await readJson(req);
  const result = await djangoFetch("/creations/", {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
