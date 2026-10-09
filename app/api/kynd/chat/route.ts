import type { NextRequest } from "next/server";

import { proxyKynd } from "@/app/api/kynd/_proxy";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return proxyKynd(req, "/kynd/chat/", "GET");
}

export function POST(req: NextRequest) {
  return proxyKynd(req, "/kynd/chat/", "POST");
}
