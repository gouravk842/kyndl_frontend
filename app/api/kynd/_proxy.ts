import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  djangoFetch,
  forward,
  getAccessToken,
  readJson,
} from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function proxyKynd(
  req: NextRequest,
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const body =
    method === "GET" || method === "DELETE" ? undefined : await readJson(req);
  const result = await djangoFetch(path, { method, body, accessToken });
  return forward(result);
}
