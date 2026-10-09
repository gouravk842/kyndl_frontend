import type { NextRequest } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/recommendations/events/", {
    method: "POST",
    body,
    accessToken: getAccessToken(req),
  });
  return forward(result);
}
