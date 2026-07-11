import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

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
  const result = await djangoFetch("/gifts/addresses/", { method: "GET", accessToken });
  return forward(result);
}

export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const body = await readJson(req);
  const result = await djangoFetch("/gifts/addresses/", { method: "POST", body, accessToken });
  return forward(result);
}
