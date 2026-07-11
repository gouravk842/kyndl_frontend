import type { NextRequest } from "next/server";

import { djangoFetch, readJson, sessionResponse } from "@/lib/server/django";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/auth/login/", { body });
  return sessionResponse(result);
}
