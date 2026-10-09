"use client";

import { motion, useReducedMotion } from "framer-motion";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { ROUTES } from "@/constants/routes";
import { MemoryBankDemo } from "@/features/memory-bank/components/story/memory-bank-demo";
import { cn } from "@/lib/utils";

const CHIPS: { title: string; note: string; at: string; tone: string }[] = [
  {
    title: "Rainy Tuesday",
    note: "A note from a day in.",
    at: "left-[2%] top-[8%]",
    tone: "bg-[#DCEAD6] text-[#3E5C42]",
  },
  {
    title: "Kitchen laugh",
    note: "A voice you can hear again.",
    at: "left-[0%] top-[42%]",
    tone: "bg-[#FBD3DE] text-[#8E1020]",
  },
  {
    title: "Train home",
    note: "A photo from the window.",
    at: "left-[8%] top-[70%]",
    tone: "bg-[#FDE7B8] text-[#8A5410]",
  },
  {
    title: "Rooftop",
    note: "Just after the lights came on.",
    at: "right-[0%] top-[12%]",
    tone: "bg-[#FFD5C8] text-[#C24B32]",
  },
  {
    title: "That song",
    note: "The one that was playing.",
    at: "right-[0%] top-[46%]",
    tone: "bg-[#F7C9D8] text-[#A33B5C]",
  },
  {
    title: "At the door",
    note: "A line you didn’t want to lose.",
    at: "right-[8%] top-[72%]",
    tone: "bg-[#F3D7B0] text-[#8A5A22]",
  },
];

function useCalm() {
  return useReducedMotion() ?? false;
}

function DayStack() {
  const reduce = useCalm();
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FDE7B8]/80 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute top-[16%] right-[10%] size-24 rounded-full bg-[#FBD3DE] blur-xl"
      />
      <div
        aria-hidden
        className="absolute bottom-[14%] left-[8%] size-20 rounded-full bg-[#DCEAD6] blur-xl"
      />
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 w-40 -translate-x-1/2 -translate-y-1/2"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="absolute -top-3 left-3 h-44 w-32 rotate-[-8deg] rounded-2xl bg-[#FBD3DE] shadow-md" />
        <div className="absolute -top-1 left-1 h-44 w-32 rotate-[6deg] rounded-2xl bg-[#FDE7B8] shadow-md" />
        <div className="relative flex h-48 w-36 flex-col justify-between rounded-2xl bg-white px-4 py-4 shadow-[0_18px_40px_-24px_rgba(58,42,37,0.45)]">
          <span className="font-serif text-3xl leading-none text-[#F2596F]">
            24
          </span>
          <span className="font-serif text-lg leading-tight text-[#3A2A25]">
            A day worth keeping.
          </span>
          <span className="text-xs tracking-[0.16em] text-[#C75B39] uppercase">
            Memory Bank
          </span>
        </div>
      </motion.div>
      {CHIPS.map((chip, index) => (
        <motion.div
          key={chip.title}
          className={cn("absolute z-20", chip.at)}
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: 6 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }
          }
        >
          <div
            className={cn(
              "max-w-[7.5rem] rounded-2xl px-2.5 py-2 text-center shadow-[0_10px_24px_-16px_rgba(58,42,37,0.45)]",
              chip.tone,
            )}
          >
            <p className="font-serif text-sm leading-tight sm:text-base">
              {chip.title}
            </p>
            <p className="mt-1 hidden font-hand text-base leading-tight opacity-80 sm:block">
              {chip.note}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function MemoryBankStory() {
  return (
    <div className="relative overflow-x-clip bg-[#FFF7F1] bg-[radial-gradient(ellipse_at_0%_0%,#FDE7B8_0%,transparent_36%),radial-gradient(ellipse_at_100%_12%,#FFD5C8_0%,transparent_32%),radial-gradient(ellipse_at_70%_100%,#DCEAD6_0%,transparent_34%)] text-[#3A2A25]">
      <svg
        viewBox="0 0 64 64"
        aria-hidden
        className="pointer-events-none absolute top-16 left-[3%] hidden w-12 text-[#F0A13D] md:block"
      >
        <path
          d="M32 6l3 12 12 2-9 8 3 12-9-6-9 6 3-12-9-8 12-2z"
          fill="#FDE7B8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C75B39] uppercase">
            Memory Bank
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-balance sm:text-6xl md:text-7xl">
            The days you{" "}
            <span className="relative inline-block">
              meant to keep
              <svg
                viewBox="0 0 220 14"
                className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full"
                aria-hidden
              >
                <path
                  d="M4 8c30-7 60 6 96 0s60-7 116 2"
                  fill="none"
                  stroke="#F0A13D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#7A6258] sm:text-lg">
            Photos, notes, and the little days, in one private place. Then grow
            them into something they can hold.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <KyndlButton href={ROUTES.memories} size="lg">
              Open the Memory Bank
            </KyndlButton>
            <KyndlButton href="#become" variant="ghost" size="lg">
              See what it becomes
            </KyndlButton>
          </div>
        </div>
        <DayStack />
      </section>

      <section
        id="become"
        className="relative scroll-mt-24 px-5 py-10 sm:px-6 md:py-16"
      >
        <div className="relative mx-auto max-w-6xl">
          <MemoryBankDemo />
          <p className="mx-auto mt-8 max-w-lg text-center text-sm leading-relaxed text-[#7A6258]">
            The bank stays yours. The keepsake is what you choose to make from
            it.
          </p>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,transparent,#FFF6E8_18%,#FFE8DC_100%)] px-5 py-20 text-center sm:px-6 md:py-28">
        <p className="font-serif text-4xl text-[#C75B39] italic sm:text-6xl">
          “You kept that day?”
        </p>
        <p className="mt-3 font-serif text-4xl text-[#3A2A25] sm:text-6xl">
          “It’s still here.”
        </p>
        <h2 className="relative mx-auto mt-10 max-w-2xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
          Because a day shouldn’t depend on{" "}
          <span className="relative inline-block">
            your memory
            <svg
              viewBox="0 0 220 70"
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+2rem)]"
              aria-hidden
            >
              <path
                d="M16 36c8-22 180-26 184 2 2 22-168 28-176 2"
                fill="none"
                stroke="#FF7A59"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </h2>
        <KyndlButton href={ROUTES.memories} size="lg" className="mt-8">
          Open the Memory Bank
        </KyndlButton>
      </section>
    </div>
  );
}
