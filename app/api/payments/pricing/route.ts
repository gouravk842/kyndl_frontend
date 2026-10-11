import { djangoFetch, forward } from "@/lib/server/django";

// Public catalog control plane (visibility + pricing). No auth. Dynamic so
// admin visibility/price edits show promptly on every surface.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await djangoFetch("/payments/pricing/", { method: "GET" });
  return forward(result);
}
