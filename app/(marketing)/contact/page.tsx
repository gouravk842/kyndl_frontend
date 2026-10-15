import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("contact");
  return createMetadata({
    title: page?.title ?? "Contact us",
    description:
      "Reach Kyndl at connect.kyndl@gmail.com for orders and support.",
    path: "/contact",
  });
}

export default function ContactPage() {
  return <LegalDocumentPage slug="contact" />;
}
