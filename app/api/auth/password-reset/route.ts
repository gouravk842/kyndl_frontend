import type { NextRequest } from "next/server";

import { djangoFetch, forward, readJson } from "@/lib/server/django";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/auth/password-reset/", { body });
  return forward(result);
}
