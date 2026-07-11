import type { NextRequest } from "next/server";

import { djangoFetch, readJson, sessionResponse } from "@/lib/server/django";

// Verifying the signup OTP activates the account and returns JWTs, so this
// establishes the session (sets cookies).
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/auth/verify-email/", { body });
  return sessionResponse(result);
}
