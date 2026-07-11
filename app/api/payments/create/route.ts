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

// Open a payment for a product and get back the checkout params (Razorpay
// order id, key, amount). Body: { product_code, reference_id?, metadata? }.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = await readJson(req);
  const result = await djangoFetch("/payments/create/", {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
