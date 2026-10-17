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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ feature: string }> },
) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { feature } = await context.params;
  const body = await readJson(req);
  const result = await djangoFetch(`/quotas/${feature}/checkout/`, {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
