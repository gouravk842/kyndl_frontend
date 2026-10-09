import type { NextRequest } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await djangoFetch(
    `/recommendations/for-you/${req.nextUrl.search}`,
    {
      method: "GET",
      accessToken: getAccessToken(req),
    },
  );
  return forward(result);
}
