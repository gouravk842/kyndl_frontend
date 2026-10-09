import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await context.params;
  const result = await djangoFetch(`/payments/invoices/${id}/`, {
    method: "GET",
    accessToken,
  });
  return forward(result);
}
