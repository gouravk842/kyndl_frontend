import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("privacy");
  return createMetadata({
    title: page?.title ?? "Privacy Policy",
    description:
      "How Kyndl collects, uses, and protects your information when you use our keepsakes and gifts.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return <LegalDocumentPage slug="privacy" />;
}
