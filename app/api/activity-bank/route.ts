import type { NextRequest } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

/** Builders and public demos browse the truth/dare catalog. */
export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search;
  const result = await djangoFetch(`/activity-bank/${qs}`, {
    method: "GET",
    accessToken: getAccessToken(req),
  });
  return forward(result);
}
