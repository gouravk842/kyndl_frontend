import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("privacy");
  return createMetadata({
    title: page?.title ?? "Privacy Policy",
    description:
      "How Kyndl collects and uses basic account and order information for the shop.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return <LegalDocumentPage slug="privacy" />;
}
