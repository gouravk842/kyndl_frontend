import type { NextRequest } from "next/server";

import { proxyKynd } from "@/app/api/kynd/_proxy";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ personId: string }> };

export async function GET(req: NextRequest, ctx: Context) {
  const { personId } = await ctx.params;
  const qs = req.nextUrl.searchParams.toString();
  const path = `/kynd/people/${personId}/items/` + (qs ? `?${qs}` : "");
  return proxyKynd(req, path, "GET");
}

export async function POST(req: NextRequest, ctx: Context) {
  const { personId } = await ctx.params;
  return proxyKynd(req, `/kynd/people/${personId}/items/`, "POST");
}
