import type { NextRequest } from "next/server";

import { djangoFetch, forward, readJson } from "@/lib/server/django";

// Signup does not establish a session — it triggers an OTP email. The browser
// is expected to move on to the verify-email step.
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/auth/signup/", { body });
  return forward(result);
}
