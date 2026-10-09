import type { NextRequest } from "next/server";

import { proxyKynd } from "@/app/api/kynd/_proxy";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ personId: string; itemId: string }> };

export async function GET(req: NextRequest, ctx: Context) {
  const { personId, itemId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/items/${itemId}/`, "GET");
}

export async function PATCH(req: NextRequest, ctx: Context) {
  const { personId, itemId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/items/${itemId}/`, "PATCH");
}

export async function DELETE(req: NextRequest, ctx: Context) {
  const { personId, itemId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/items/${itemId}/`, "DELETE");
}
