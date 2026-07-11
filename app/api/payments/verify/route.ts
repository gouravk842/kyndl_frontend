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

// Verify a Razorpay checkout success and capture the payment. Body:
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }.
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = await readJson(req);
  const result = await djangoFetch("/payments/verify/", {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
