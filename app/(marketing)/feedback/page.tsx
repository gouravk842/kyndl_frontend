import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { ideaHref } from "@/features/ideas/idea-href";
import { FeedbackForm } from "@/features/testimonials/components/feedback-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Share your feedback",
  description:
    "Tell us how a Kyndl keepsake landed — rating, a short note, and which experience. We review every submission before it appears on the site.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 15% 10%, rgba(255,160,120,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 90% 90%, rgba(242,89,111,0.16) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <PageContainer size="md" className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Feedback
          </p>
          <h1 className="mt-4 font-display text-3xl text-[#3A2A25] md:text-4xl">
            How did it feel?
          </h1>
          <p className="mt-4 text-[#7A6258]">
            Rate an experience, leave a short note, and tell us which keepsake
            it was. We read every one before it goes on the home page.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <FeedbackForm />
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-sm text-[#7A6258]">
          Looking for something we don&apos;t have?{" "}
          <Link
            href={ideaHref({ source: "feedback" })}
            className="font-semibold text-[#C75B39] hover:text-[#9e3f21]"
          >
            Leave the idea here →
          </Link>
        </p>
      </PageContainer>
    </section>
  );
}
