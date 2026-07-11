import type { NextRequest } from "next/server";

import { djangoFetch, forward } from "@/lib/server/django";

// Public catalog — no auth. Kept dynamic so stock/pricing edits show promptly.
export const dynamic = "force-dynamic";

// List active gifts. Forwards ?q, ?sort and ?category through to Django.
export async function GET(req: NextRequest) {
  const result = await djangoFetch(`/gifts/catalog/${req.nextUrl.search}`, { method: "GET" });
  return forward(result);
}
