import type { NextRequest } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

/** A person telling us something went wrong. Lands in the admin reports queue. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/issues/reports/", {
    method: "POST",
    body,
    accessToken: getAccessToken(req),
  });
  return forward(result);
}
