"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

type TabId = "scratch" | "card" | "blur";

const tabs: { id: TabId; label: string }[] = [
  { id: "scratch", label: "Scratch to reveal" },
  { id: "card", label: "Open the card" },
  { id: "blur", label: "Unlock message" },
];

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("scratch");
  const [scratchProgress, setScratchProgress] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);
  const [messageRevealed, setMessageRevealed] = useState(false);

  const handleScratch = useCallback(() => {
    setScratchProgress((p) => Math.min(100, p + 18));
  }, []);

  return (
    <section id="showcase" className="relative py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,160,120,0.25) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <PageContainer size="xl" className="relative">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#C75B39] uppercase">
            Try it
          </p>
          <h2 className="mt-4 text-center font-display text-3xl text-[#3A2A25] md:text-4xl lg:text-5xl">
            Preview the surprise before you send.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-[#7A6258]">
            Real gifting is emotional. Test reveal moments, card opens, and
            hidden messages exactly how your loved one will experience them.
          </p>
        </FadeIn>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setScratchProgress(0);
                setCardOpen(false);
                setMessageRevealed(false);
              }}
              className={cn(
                "rounded-full px-5 py-2 text-sm transition-all duration-300",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white kyndl-glow-warm"
                  : "border border-[#F2DACE] bg-white/60 text-[#7A6258] hover:border-[#FF7A59]/40 hover:text-[#3A2A25]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <div className="mx-auto mt-12 max-w-lg">
            <div className="kyndl-card-soft relative overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white p-8 min-h-[320px] flex items-center justify-center">
              {activeTab === "scratch" && (
                <div className="relative w-full text-center">
                  <button
                    type="button"
                    onClick={handleScratch}
                    className="relative mx-auto block w-full max-w-sm cursor-pointer select-none"
                    aria-label="Scratch to reveal hidden message"
                  >
                    <div className="relative rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] p-8 min-h-[180px] flex items-center justify-center overflow-hidden">
                      <p
                        className={cn(
                          "font-display text-xl text-[#3A2A25] transition-opacity duration-500",
                          scratchProgress < 40 && "opacity-0",
                        )}
                      >
                        &ldquo;You&apos;re still my favorite
                        <span className="kyndl-text-warm"> person.&rdquo;</span>
                      </p>
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                        style={{ opacity: 1 - scratchProgress / 100 }}
                      >
                        <span className="text-[#92786C] text-sm">
                          {scratchProgress < 100
                            ? "Tap to scratch away the surface"
                            : "Revealed"}
                        </span>
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-[#FFD9B0] via-[#FBD9CE] to-[#F7C9C0]"
                          style={{
                            clipPath: `inset(0 ${100 - scratchProgress}% 0 0)`,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                  {scratchProgress >= 100 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-sm text-[#C75B39]"
                    >
                      That&apos;s the feeling you send.
                    </motion.p>
                  )}
                </div>
              )}

              {activeTab === "card" && (
                <div className="text-center w-full">
                  <motion.button
                    type="button"
                    onClick={() => setCardOpen(true)}
                    className="mx-auto block w-full max-w-sm cursor-pointer"
                    aria-label="Open digital love card"
                    animate={{ rotateY: cardOpen ? 8 : 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className={cn(
                        "rounded-2xl border border-[#F4DDD0] bg-gradient-to-br from-[#FFF1E9] to-[#FDEBE6] p-10 transition-all duration-700",
                        cardOpen && "border-[#FF7A59]/50 kyndl-glow-warm",
                      )}
                    >
                      {!cardOpen ? (
                        <div>
                          <p className="text-xs tracking-widest text-[#C75B39] uppercase">
                            Tap to open
                          </p>
                          <p className="mt-4 font-display text-2xl text-[#3A2A25]">
                            A moment awaits
                          </p>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="font-display text-2xl text-[#3A2A25]">
                            Happy anniversary,
                          </p>
                          <p className="mt-2 kyndl-text-warm font-display text-xl">
                            my love.
                          </p>
                          <p className="mt-6 text-sm text-[#92786C]">
                            — Always, you know who
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                </div>
              )}

              {activeTab === "blur" && (
                <div className="text-center w-full">
                  <button
                    type="button"
                    onClick={() => setMessageRevealed(true)}
                    className="mx-auto block w-full max-w-sm cursor-pointer rounded-2xl border border-[#F4DDD0] bg-[#FFF7F1] p-8 min-h-[180px] flex flex-col items-center justify-center transition-all duration-500 hover:border-[#FF7A59]/40"
                    aria-label="Reveal blurred message"
                  >
                    <p
                      className={cn(
                        "font-display text-xl text-[#3A2A25] transition-all duration-700",
                        !messageRevealed && "blur-md select-none",
                      )}
                    >
                      I fall in love with you
                      <br />a little more every day.
                    </p>
                    {!messageRevealed && (
                      <span className="mt-4 text-xs text-[#92786C]">
                        Tap to unlock
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
