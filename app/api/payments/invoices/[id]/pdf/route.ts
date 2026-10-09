import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { djangoFetchBinary, getAccessToken } from "@/lib/server/django";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { detail: "Not authenticated.", code: "not_authenticated" },
    { status: 401 },
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = getAccessToken(req);
  if (!accessToken) return unauthorized();

  const { id } = await context.params;
  const result = await djangoFetchBinary(`/payments/invoices/${id}/pdf/`, {
    method: "GET",
    accessToken,
  });

  if (result.status >= 400) {
    // Django may return JSON error as bytes.
    let detail = "Could not download invoice.";
    let code = "invoice_error";
    try {
      const text = new TextDecoder().decode(result.body);
      const parsed = JSON.parse(text) as { detail?: string; code?: string };
      if (parsed.detail) detail = parsed.detail;
      if (parsed.code) code = parsed.code;
    } catch {
      // keep defaults
    }
    return NextResponse.json({ detail, code }, { status: result.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", result.contentType || "application/pdf");
  if (result.contentDisposition) {
    headers.set("Content-Disposition", result.contentDisposition);
  } else {
    headers.set(
      "Content-Disposition",
      `attachment; filename="invoice-${id}.pdf"`,
    );
  }

  return new NextResponse(result.body, { status: 200, headers });
}
