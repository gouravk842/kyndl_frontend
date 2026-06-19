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
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, #8E1020 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <PageContainer size="xl" className="relative">
        <FadeIn>
          <p className="text-center text-sm font-medium tracking-[0.2em] text-[#D4A373] uppercase">
            Try it
          </p>
          <h2 className="mt-4 text-center font-display text-3xl text-[#F5E9E2] md:text-4xl lg:text-5xl">
            Preview the surprise before you send.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-[#B3B3B3]">
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
                  ? "bg-[#B11226] text-[#F5E9E2] kyndl-glow-red"
                  : "border border-white/[0.08] text-[#B3B3B3] hover:border-[#C21830]/30 hover:text-[#F5E9E2]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <div className="mx-auto mt-12 max-w-lg">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111111] p-8 min-h-[320px] flex items-center justify-center">
              {activeTab === "scratch" && (
                <div className="relative w-full text-center">
                  <button
                    type="button"
                    onClick={handleScratch}
                    className="relative mx-auto block w-full max-w-sm cursor-pointer select-none"
                    aria-label="Scratch to reveal hidden message"
                  >
                    <div className="relative rounded-2xl border border-[#C21830]/20 bg-[#151515] p-8 min-h-[180px] flex items-center justify-center overflow-hidden">
                      <p
                        className={cn(
                          "font-display text-xl text-[#F5E9E2] transition-opacity duration-500",
                          scratchProgress < 40 && "opacity-0",
                        )}
                      >
                        &ldquo;You&apos;re still my favorite
                        <span className="text-[#C21830]"> person.&rdquo;</span>
                      </p>
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-[#151515] transition-opacity duration-500"
                        style={{ opacity: 1 - scratchProgress / 100 }}
                      >
                        <span className="text-[#B3B3B3] text-sm">
                          {scratchProgress < 100
                            ? "Tap to scratch away the surface"
                            : "Revealed"}
                        </span>
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-[#8E1020]/30 via-[#111111] to-[#151515]"
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
                      className="mt-4 text-sm text-[#D4A373]"
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
                        "rounded-2xl border border-[#C21830]/25 bg-gradient-to-br from-[#151515] to-[#111111] p-10 transition-all duration-700",
                        cardOpen && "border-[#C21830]/50 kyndl-glow-red",
                      )}
                    >
                      {!cardOpen ? (
                        <div>
                          <p className="text-xs tracking-widest text-[#D4A373] uppercase">
                            Tap to open
                          </p>
                          <p className="mt-4 font-display text-2xl text-[#F5E9E2]">
                            A moment awaits
                          </p>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="font-display text-2xl text-[#F5E9E2]">
                            Happy anniversary,
                          </p>
                          <p className="mt-2 text-[#C21830] font-display text-xl">
                            my love.
                          </p>
                          <p className="mt-6 text-sm text-[#B3B3B3]">
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
                    className="mx-auto block w-full max-w-sm cursor-pointer rounded-2xl border border-white/[0.06] bg-[#151515] p-8 min-h-[180px] flex flex-col items-center justify-center transition-all duration-500 hover:border-[#C21830]/30"
                    aria-label="Reveal blurred message"
                  >
                    <p
                      className={cn(
                        "font-display text-xl text-[#F5E9E2] transition-all duration-700",
                        !messageRevealed && "blur-md select-none",
                      )}
                    >
                      I fall in love with you
                      <br />a little more every day.
                    </p>
                    {!messageRevealed && (
                      <span className="mt-4 text-xs text-[#B3B3B3]">
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
