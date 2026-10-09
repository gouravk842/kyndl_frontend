import type { NextRequest } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ kind: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { kind, id } = await params;
  const result = await djangoFetch(
    `/recommendations/pairings/${kind}/${id}/${req.nextUrl.search}`,
    {
      method: "GET",
      accessToken: getAccessToken(req),
    },
  );
  return forward(result);
}
