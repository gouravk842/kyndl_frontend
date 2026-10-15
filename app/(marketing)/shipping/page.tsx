import type { Metadata } from "next";

import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { createMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("shipping");
  return createMetadata({
    title: page?.title ?? "Shipping Policy",
    description:
      "How Kyndl ships gift orders within India — India Post or courier, Indian pincodes only.",
    path: "/shipping",
  });
}

export default function ShippingPage() {
  return <LegalDocumentPage slug="shipping" />;
}
