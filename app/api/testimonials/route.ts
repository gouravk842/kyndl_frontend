import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

/** Public approved testimonials for the homepage carousel. */
export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search;
  const result = await djangoFetch(`/testimonials/${qs}`, {
    method: "GET",
    accessToken: getAccessToken(req),
  });
  return forward(result);
}

/** Submit feedback — lands as pending until an admin approves it. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/testimonials/", {
    method: "POST",
    body,
    accessToken: getAccessToken(req),
  });
  return forward(result);
}
