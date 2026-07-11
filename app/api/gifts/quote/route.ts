import type { NextRequest } from "next/server";

import { djangoFetch, forward, readJson } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// Price a cart (subtotal + per-vendor shipping + total) — public, no order created.
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const result = await djangoFetch("/gifts/quote/", { method: "POST", body });
  return forward(result);
}
