import type { NextRequest } from "next/server";

import { djangoFetch, forward } from "@/lib/server/django";

// Typeahead for master categories — no auth. Forwards ?q and ?limit.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await djangoFetch(
    `/gifts/categories/suggest/${req.nextUrl.search}`,
    { method: "GET" },
  );
  return forward(result);
}
