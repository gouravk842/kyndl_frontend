import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { COOKIE_NAMES } from "@/constants/cookies";
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

function referralCodeFrom(req: NextRequest): string {
  return (req.cookies.get(COOKIE_NAMES.REFERRAL_CODE)?.value || "")
    .trim()
    .toLowerCase();
}

// Open a payment for a product and get back the checkout params (Razorpay
// order id, key, amount). Body: { product_code, reference_id?, metadata? }.
// When a kyndl_ref cookie is present, stamp metadata.referral_code server-side
// (BFF wins over any client-supplied value).
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = (await readJson(req)) as Record<string, unknown>;
  const metadata =
    body.metadata &&
    typeof body.metadata === "object" &&
    !Array.isArray(body.metadata)
      ? { ...(body.metadata as Record<string, unknown>) }
      : {};

  const code = referralCodeFrom(req);
  if (code) {
    metadata.referral_code = code;
  }

  const result = await djangoFetch("/payments/create/", {
    method: "POST",
    body: { ...body, metadata },
    accessToken,
  });
  return forward(result);
}
