import type { NextRequest } from "next/server";

import { djangoFetch, forward } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// In this Next version, dynamic route params are async.
type Context = { params: Promise<{ slug: string }> };

// Public vendor storefront: shop info + its active products.
export async function GET(_req: NextRequest, ctx: Context) {
  const { slug } = await ctx.params;
  const result = await djangoFetch(`/gifts/shops/${slug}/`, { method: "GET" });
  return forward(result);
}
