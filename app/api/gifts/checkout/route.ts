import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

// Reads the auth cookie per request — never cache.
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Create a gift order from the cart + shipping address, and open its payment.
// Body: { items: [{slug, quantity}], shipping: {...} }.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = await readJson(req);
  const result = await djangoFetch("/gifts/checkout/", {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
