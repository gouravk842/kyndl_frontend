import type { NextRequest } from "next/server";

import { djangoFetch, forward } from "@/lib/server/django";

// Typeahead for subcategories under a master — no auth.
// Forwards ?category, ?q and ?limit.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const result = await djangoFetch(
    `/gifts/subcategories/${req.nextUrl.search}`,
    { method: "GET" },
  );
  return forward(result);
}
