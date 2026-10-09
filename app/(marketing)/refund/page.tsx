import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("refund");
  return createMetadata({
    title: page?.title ?? "Refund Policy",
    description:
      "When and how Kyndl issues refunds for digital experiences and physical gifts.",
    path: "/refund",
  });
}

export default function RefundPage() {
  return <LegalDocumentPage slug="refund" />;
}
