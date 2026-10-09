import type { NextRequest } from "next/server";

import { proxyKynd } from "@/app/api/kynd/_proxy";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ personId: string }> };

export async function GET(req: NextRequest, ctx: Context) {
  const { personId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/`, "GET");
}

export async function PATCH(req: NextRequest, ctx: Context) {
  const { personId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/`, "PATCH");
}

export async function DELETE(req: NextRequest, ctx: Context) {
  const { personId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/`, "DELETE");
}
