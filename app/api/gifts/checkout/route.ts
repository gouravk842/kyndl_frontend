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

// Create a gift order from the cart + shipping address, and open its payment.
// Body: { items: [{slug, quantity}], shipping: {...}, referral_code? }.
// Injects kyndl_ref cookie as referral_code when present (BFF wins).
export async function POST(req: NextRequest) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const body = (await readJson(req)) as Record<string, unknown>;
  const cookieCode = (req.cookies.get(COOKIE_NAMES.REFERRAL_CODE)?.value || "")
    .trim()
    .toLowerCase();
  if (cookieCode) {
    body.referral_code = cookieCode;
  }

  const result = await djangoFetch("/gifts/checkout/", {
    method: "POST",
    body,
    accessToken,
  });
  return forward(result);
}
