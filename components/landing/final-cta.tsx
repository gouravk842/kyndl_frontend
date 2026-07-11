"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

export function FinalCta() {
  return (
    <section className="relative py-24 md:py-32">
      <PageContainer size="lg">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-[#F4DDD0] bg-gradient-to-br from-[#FFF1E9] via-[#FDEBE6] to-[#FCE3DC] px-6 py-16 text-center md:px-12 md:py-24"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* glow blooms */}
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 20% 0%, rgba(255,160,120,0.4) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 85% 100%, rgba(242,89,111,0.3) 0%, transparent 65%)",
            }}
            aria-hidden
          />

          <div className="relative">
            <span className="kyndl-glow-warm mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#F2596F]">
              <Heart className="size-6 fill-white text-white" aria-hidden />
            </span>

            <h2 className="mx-auto mt-8 max-w-2xl font-display text-3xl leading-tight text-[#3A2A25] md:text-4xl lg:text-5xl">
              Someone you love is one
              <br />
              <span className="kyndl-text-warm">keepsake away from tears.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[#7A6258]">
              Make a personalized digital keepsake in minutes — and send it
              exactly when it will land the hardest.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <KyndlButton size="lg" href={ROUTES.register} className="group">
                Create your first keepsake
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </KyndlButton>
              <KyndlButton
                size="lg"
                variant="secondary"
                href={ROUTES.experiences}
              >
                Browse experiences
              </KyndlButton>
            </div>

            <p className="mt-6 text-sm text-[#92786C]">
              Free to start · No design skills needed · Ready in minutes
            </p>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
