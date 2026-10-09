import type { NextRequest } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

/** Public click ingest — auth optional (visitor_user when cookie present). */
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  const body = await readJson(req);
  const result = await djangoFetch("/referrals/clicks/", {
    method: "POST",
    body,
    accessToken: accessToken || undefined,
  });
  return forward(result);
}
