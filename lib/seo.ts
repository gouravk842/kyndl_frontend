import type { Metadata } from "next";

import { clientEnv } from "@/config/env";
import { siteConfig } from "@/config/site";

type CreateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
};

const defaultOgImage = "/og-default.png";

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "",
  image = defaultOgImage,
  noIndex = false,
  keywords = [...siteConfig.keywords],
}: CreateMetadataOptions = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const url = new URL(path, clientEnv.NEXT_PUBLIC_APP_URL).toString();
  const ogImage = image.startsWith("http")
    ? image
    : new URL(image, clientEnv.NEXT_PUBLIC_APP_URL).toString();

  return {
    title: pageTitle,
    description,
    keywords,
    metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
      creator: "@kyndl",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
