import type { NextRequest } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

/** A request for something we don't offer yet. Lands in the admin ideas queue. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/ideas/", {
    method: "POST",
    body,
    accessToken: getAccessToken(req),
  });
  return forward(result);
}
