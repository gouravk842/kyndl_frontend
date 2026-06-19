"use client";

import { motion } from "framer-motion";

import { AmbientBackground } from "@/components/landing/ambient-background";
import { KyndlButton } from "@/components/landing/kyndl-button";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants/routes";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <AmbientBackground />
      <PageContainer size="md" className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-3xl leading-tight text-[#F5E9E2] md:text-4xl lg:text-5xl kyndl-text-glow">
            Some feelings deserve
            <br />
            more than a plain message.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[#B3B3B3]">
            Create a personalized digital gift in minutes and send it exactly
            when it will mean the most.
          </p>
          <div className="mt-10 flex justify-center">
            <KyndlButton size="lg" href={ROUTES.register}>
              Create Your First Gift
            </KyndlButton>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
