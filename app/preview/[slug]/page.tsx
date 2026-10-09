import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmbeddedExperience } from "@/components/experiences/embedded-experience";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { getExperience } from "@/lib/experiences";
import { createMetadata } from "@/lib/seo";
import { getExperienceView } from "@/lib/server/experiences";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) return createMetadata({ title: "Preview" });
  return createMetadata({
    title: `${exp.name} — public view`,
    description: `See how ${exp.name} looks when shared.`,
    path: `/preview/${slug}`,
  });
}

/**
 * Fullscreen demo of an experience type — same components as the product-page
 * live embed, at natural viewport size (and with Red Zone age gates), so it
 * matches what a published `/v/<token>` looks like.
 *
 * Note: do not call helpers exported from the `"use client"` embed module here —
 * that throws on the server. Catalog `embedded` / `inlineEmbed` flags are enough.
 */
export default async function ExperiencePreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const exp = await getExperienceView(slug);
  if (
    !exp ||
    exp.status !== "live" ||
    !(exp.embedded === true || exp.inlineEmbed === true)
  ) {
    notFound();
  }

  return (
    <div className="flex h-dvh flex-col bg-[#FFF7F1]">
      <div className="shrink-0">
        <MarketingHeader />
      </div>
      <div className="relative min-h-0 flex-1">
        <EmbeddedExperience slug={slug} variant="public-demo" />
      </div>
    </div>
  );
}
