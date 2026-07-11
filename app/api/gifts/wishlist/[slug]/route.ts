import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetch, forward, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

// In this Next version, dynamic route params are async.
type Context = { params: Promise<{ slug: string }> };

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

// Add a gift to the wishlist.
export async function POST(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { slug } = await ctx.params;
  const result = await djangoFetch(`/gifts/wishlist/${slug}/`, { method: "POST", accessToken });
  return forward(result);
}

// Remove a gift from the wishlist.
export async function DELETE(req: NextRequest, ctx: Context) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();
  const { slug } = await ctx.params;
  const result = await djangoFetch(`/gifts/wishlist/${slug}/remove/`, {
    method: "DELETE",
    accessToken,
  });
  return forward(result);
}
