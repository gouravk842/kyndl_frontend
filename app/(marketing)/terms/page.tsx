import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("terms");
  return createMetadata({
    title: page?.title ?? "Terms & Conditions",
    description:
      "Terms governing your use of Kyndl digital keepsakes, gifts, and related services.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return <LegalDocumentPage slug="terms" />;
}
