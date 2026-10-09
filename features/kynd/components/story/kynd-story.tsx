"use client";

import { motion, useReducedMotion } from "framer-motion";

import { KyndlButton } from "@/components/landing/kyndl-button";
import { ROUTES } from "@/constants/routes";
import { KyndDemo } from "@/features/kynd/components/story/kynd-demo";
import { Mark, type MarkName } from "@/features/kynd/components/story/marks";
import { cn } from "@/lib/utils";

const CHIPS: {
  mark: MarkName;
  title: string;
  note: string;
  at: string;
  tone: string;
}[] = [
  {
    mark: "tulip",
    title: "White tulips",
    note: "Her favourite flowers.",
    at: "left-[4%] top-[10%]",
    tone: "bg-[#E5F0E2] text-[#3E5C42]",
  },
  {
    mark: "lipstick",
    title: "Velvet Teddy",
    note: "The shade she loved.",
    at: "left-[0%] top-[42%]",
    tone: "bg-[#FBD3DE] text-[#8E1020]",
  },
  {
    mark: "shoe",
    title: "UK 5",
    note: "His size.",
    at: "left-[8%] top-[68%]",
    tone: "bg-[#FDE7B8] text-[#8A5410]",
  },
  {
    mark: "bowl",
    title: "Izumi",
    note: "A place she loves.",
    at: "right-[2%] top-[12%]",
    tone: "bg-[#FFD5C8] text-[#C24B32]",
  },
  {
    mark: "cup",
    title: "Vanilla latte",
    note: "How she takes it.",
    at: "right-[0%] top-[44%]",
    tone: "bg-[#F3D7B0] text-[#8A5A22]",
  },
  {
    mark: "headphones",
    title: "Coldplay",
    note: "The songs she plays.",
    at: "right-[8%] top-[70%]",
    tone: "bg-[#F7C9D8] text-[#A33B5C]",
  },
];

function useCalm() {
  return useReducedMotion() ?? false;
}

function Doodles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      <svg
        viewBox="0 0 80 80"
        className="absolute top-6 left-[6%] w-16 text-[#F0A13D]"
      >
        <path
          d="M40 8l4 14 14 2-11 9 4 14-11-8-11 8 4-14-11-9 14-2z"
          fill="#FDE7B8"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <svg
        viewBox="0 0 120 40"
        className="absolute top-10 right-[8%] w-28 text-[#F2596F]"
      >
        <path
          d="M4 28c18-16 28-16 40-4 8 8 16 6 28-6 10-10 22-8 40 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <svg
        viewBox="0 0 90 70"
        className="absolute bottom-8 left-[4%] w-20 text-[#6E8B6A]"
      >
        <path
          d="M10 50c20-40 60-40 70 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M62 28l16 6-10 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function HeroOrbit() {
  const reduce = useCalm();
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem]">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FBD3DE]/70 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute top-[18%] right-[8%] size-24 rounded-full bg-[#FDE7B8] blur-xl"
      />
      <div
        aria-hidden
        className="absolute bottom-[12%] left-[6%] size-20 rounded-full bg-[#DCEAD6] blur-xl"
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-spin motion-safe:[animation-duration:60s] sm:size-80"
        style={{
          background:
            "conic-gradient(from 40deg, #FF7A59, #F0A13D, #F2596F, #6E8B6A, #D4A373, #FF7A59)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <img
          src="/couple.png"
          alt="A couple sitting together"
          className="h-56 w-auto drop-shadow-[0_16px_28px_rgba(242,89,111,0.28)] sm:h-[15.5rem]"
        />
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
          <button
            type="button"
            className={cn(
              "group relative flex max-w-[7.5rem] flex-col items-center rounded-2xl px-2.5 py-2 text-center shadow-[0_10px_24px_-16px_rgba(58,42,37,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2596F]",
              chip.tone,
            )}
            aria-label={`${chip.title}. ${chip.note}`}
          >
            <Mark name={chip.mark} className="h-9 w-auto" />
            <span className="mt-1 font-serif text-sm leading-tight sm:text-base">
              {chip.title}
            </span>
            <span className="pointer-events-none absolute top-full z-10 mt-1 hidden w-max font-hand text-lg text-[#7A6258] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
              {chip.note}
            </span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

export function KyndStory() {
  return (
    <div className="relative overflow-x-clip bg-[#FFF7F1] bg-[radial-gradient(ellipse_at_0%_0%,#FFD9CC_0%,transparent_36%),radial-gradient(ellipse_at_100%_8%,#FBD3DE_0%,transparent_32%),radial-gradient(ellipse_at_80%_100%,#FDE7B8_0%,transparent_34%)] text-[#3A2A25]">
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
      <svg
        viewBox="0 0 140 50"
        aria-hidden
        className="pointer-events-none absolute bottom-16 left-[6%] hidden w-32 text-[#6E8B6A] md:block"
      >
        <path
          d="M6 30c22-18 40-8 58-16 16-6 28 8 48 2 12-4 18-2 24 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M108 18l18 8-12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#F2596F] uppercase">
            Kynd
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-balance sm:text-6xl md:text-7xl">
            The{" "}
            <span className="relative inline-block">
              little things
              <svg
                viewBox="0 0 180 14"
                className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full"
                aria-hidden
              >
                <path
                  d="M4 8c24-7 48 6 74 0s50-7 98 2"
                  fill="none"
                  stroke="#FF7A59"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            matter.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#7A6258] sm:text-lg">
            Kynd remembers the things you notice about the people you love.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <KyndlButton href={ROUTES.kynd} size="lg">
              Discover Kynd
            </KyndlButton>
            <KyndlButton href="#ask" variant="ghost" size="lg">
              See how it works
            </KyndlButton>
          </div>
        </div>
        <HeroOrbit />
      </section>

      <section
        id="ask"
        className="relative scroll-mt-24 px-5 py-10 sm:px-6 md:py-16"
      >
        <Doodles />
        <div className="relative mx-auto max-w-6xl">
          <KyndDemo />
          <p className="mx-auto mt-8 max-w-lg text-center text-sm leading-relaxed text-[#7A6258]">
            A separate Kynd for each person. Only you can see it.
          </p>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,transparent,#FFF0E8_18%,#FDE4EC_100%)] px-5 py-20 text-center sm:px-6 md:py-28">
        <p className="font-serif text-4xl text-[#F2596F] italic sm:text-6xl">
          “You remembered?”
        </p>
        <p className="mt-3 font-serif text-4xl text-[#C75B39] sm:text-6xl">
          “Of course.”
        </p>
        <h2 className="relative mx-auto mt-10 max-w-2xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
          Because the little things are{" "}
          <span className="relative inline-block">
            never little
            <svg
              viewBox="0 0 200 70"
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+2rem)]"
              aria-hidden
            >
              <path
                d="M16 36c8-22 168-26 170 2 2 22-156 28-164 2"
                fill="none"
                stroke="#F0A13D"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </h2>
        <KyndlButton href={ROUTES.kynd} size="lg" className="mt-8">
          Discover Kynd
        </KyndlButton>
      </section>
    </div>
  );
}
