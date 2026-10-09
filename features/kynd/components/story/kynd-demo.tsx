"use client";

import { SendHorizontal } from "lucide-react";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { Mark, type MarkName } from "@/features/kynd/components/story/marks";
import {
  ASK_EMPTY,
  keywordsFrom,
  type KyndFact,
  matchFact,
} from "@/features/kynd/lib/ask";
import { cn } from "@/lib/utils";

const FACTS: KyndFact[] = [
  {
    id: "lipstick",
    label: "Lipstick",
    value: "MAC Velvet Teddy",
    keywords: keywordsFrom("Lipstick shade makeup"),
  },
  {
    id: "colour",
    label: "Favourite colour",
    value: "Ivory",
    keywords: keywordsFrom("Favourite colour"),
  },
  {
    id: "shoe",
    label: "Shoe size",
    value: "UK 5",
    keywords: keywordsFrom("Shoe size"),
  },
  {
    id: "food",
    label: "Restaurant",
    value: "Izumi",
    keywords: keywordsFrom("Restaurant"),
  },
  {
    id: "coffee",
    label: "Coffee",
    value: "Vanilla latte",
    keywords: keywordsFrom("Coffee"),
  },
  {
    id: "song",
    label: "Songs",
    value: "Coldplay",
    keywords: keywordsFrom("Songs music"),
  },
];

export const PROMPTS = [
  "What’s her lipstick shade again?",
  "Wait… what size does he wear?",
  "Which restaurant did she love?",
  "How does she take her coffee?",
  "What’s her favourite colour?",
  "What songs does she play?",
];

const MARK_FOR: Record<string, MarkName> = {
  lipstick: "lipstick",
  colour: "heart",
  shoe: "shoe",
  food: "bowl",
  coffee: "cup",
  song: "headphones",
};

const PROMPT_WASH = [
  "bg-[#F8C9D4]",
  "bg-[#F6D59A]",
  "bg-[#FFC2B0]",
  "bg-[#E8C99A]",
  "bg-[#F4B4C6]",
  "bg-[#C5D9C2]",
];

const BUBBLE: Record<string, string> = {
  lipstick: "border-[#F2596F]/35 bg-[#FFF0F4]",
  heart: "border-[#E07A92]/40 bg-[#FFF5F7]",
  shoe: "border-[#F0A13D]/55 bg-[#FFF8EC]",
  bowl: "border-[#FF7A59]/40 bg-[#FFF3EE]",
  cup: "border-[#D4A373]/70 bg-[#FBF6EE]",
  headphones: "border-[#6E8B6A]/40 bg-[#F3F8F2]",
};

type Line = {
  id: string;
  from: "you" | "kynd";
  text: string;
  detail?: string;
  mark?: MarkName;
  at: string;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function clock() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function KyndDemo() {
  const listId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const [facts, setFacts] = useState(FACTS);
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [lines, typing, reduce]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function ask(raw: string) {
    const text = raw.trim().slice(0, 180);
    if (!text || typing) return;
    setActive(text);
    setLines((current) => [
      ...current,
      { id: newId(), from: "you", text, at: clock() },
    ]);
    setDraft("");
    setTyping(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        const fact = matchFact(text, facts);
        setLines((current) => [
          ...current,
          fact
            ? {
                id: newId(),
                from: "kynd",
                text: fact.value,
                detail: `Saved as ${fact.label.toLowerCase()}.`,
                mark: MARK_FOR[fact.id],
                at: clock(),
              }
            : {
                id: newId(),
                from: "kynd",
                text: ASK_EMPTY,
                at: clock(),
              },
        ]);
        setTyping(false);
      },
      reduce ? 0 : 850,
    );
  }

  useEffect(() => {
    const id = window.setTimeout(
      () => {
        ask(PROMPTS[0] ?? "");
      },
      reduce ? 0 : 700,
    );
    return () => window.clearTimeout(id);
    // Show the first question once, so the thread is already alive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFact(event: FormEvent) {
    event.preventDefault();
    const nextLabel = label.trim().slice(0, 40);
    const nextValue = value.trim().slice(0, 80);
    if (!nextLabel || !nextValue) return;
    setFacts((current) => [
      ...current,
      {
        id: newId(),
        label: nextLabel,
        value: nextValue,
        keywords: keywordsFrom(nextLabel),
      },
    ]);
    setLabel("");
    setValue("");
    setAdding(false);
  }

  const lane = reduce ? PROMPTS : [...PROMPTS, ...PROMPTS];

  return (
    <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#C75B39] uppercase">
          The things that slip away
        </p>
        <div
          className="kynd-lane relative mt-4 h-[22rem] overflow-hidden sm:h-[26rem] lg:h-[32rem]"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <div className={cn(!reduce && "kynd-convey")}>
            {lane.map((question, index) => {
              const on = active === question;
              return (
                <button
                  key={`${question}-${index}`}
                  type="button"
                  onClick={() => ask(question)}
                  className={cn(
                    "block w-full py-3 text-left font-serif text-[1.65rem] leading-snug italic transition-colors sm:text-3xl",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2596F]",
                    on
                      ? "text-[#3A2A25]"
                      : "text-[#8A7368] hover:text-[#3A2A25]",
                  )}
                >
                  <span className="relative inline">
                    <span className="relative z-10">“{question}”</span>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-1 z-0 h-[0.55em] rounded-sm transition-opacity",
                        PROMPT_WASH[index % PROMPT_WASH.length],
                        on ? "opacity-100" : "opacity-80",
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-6 max-w-md font-serif text-2xl leading-snug sm:text-3xl">
          We notice hundreds of{" "}
          <span className="bg-[#F6D59A] px-1">little things</span>.
        </p>
        <p className="mt-1 max-w-md font-serif text-2xl leading-snug text-[#C24B5A] italic sm:text-3xl">
          We just don’t remember all of them.
        </p>
      </div>

      <section
        aria-labelledby="ask-title"
        className="flex h-[34rem] flex-col overflow-hidden rounded-[1.6rem] border border-[#F4C9C0] bg-white shadow-[0_24px_50px_-28px_rgba(242,89,111,0.45)] sm:h-[36rem]"
      >
        <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF7A59] via-[#F2596F] to-[#E07A92] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white font-serif text-sm text-[#F2596F]">
              K
            </span>
            <span className="min-w-0">
              <span id="ask-title" className="block text-sm font-medium">
                Kynd
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/85">
                <span
                  className={cn(
                    "size-1.5 rounded-full bg-[#D7F5C8]",
                    typing && "motion-safe:animate-pulse",
                  )}
                />
                {typing ? "Looking that up" : "With you"}
              </span>
            </span>
          </div>
          <p className="truncate font-serif text-lg">Ananya</p>
        </header>

        <div
          ref={scroller}
          id={listId}
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[linear-gradient(180deg,#FFF8F3_0%,#FFF0F4_55%,#FFF8EC_100%)] px-4 py-4"
        >
          {lines.map((line) =>
            line.from === "you" ? (
              <div key={line.id} className="ml-auto max-w-[85%]">
                <p className="rounded-2xl rounded-br-md bg-gradient-to-br from-[#FF7A59] to-[#F2596F] px-3.5 py-2.5 text-[15px] leading-relaxed text-white">
                  {line.text}
                </p>
                <p className="mt-1 text-right text-[11px] text-[#B5A197]">
                  {line.at}
                </p>
              </div>
            ) : (
              <div key={line.id} className="flex max-w-[88%] items-end gap-2">
                <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF1E9]">
                  {line.mark ? (
                    <Mark name={line.mark} className="h-4 w-auto" />
                  ) : (
                    <span className="font-serif text-[10px] text-[#C75B39]">
                      K
                    </span>
                  )}
                </span>
                <div>
                  <p className="mb-1 text-[11px] text-[#92786C]">Kynd</p>
                  <div
                    className={cn(
                      "rounded-2xl rounded-bl-md border bg-white px-3.5 py-2.5 text-[15px] leading-relaxed text-[#3A2A25]",
                      (line.mark && BUBBLE[line.mark]) || "border-[#F2DACE]",
                    )}
                  >
                    <p
                      className={
                        line.detail ? "font-serif text-lg leading-tight" : ""
                      }
                    >
                      {line.text}
                    </p>
                    {line.detail ? (
                      <p className="mt-1 text-sm text-[#7A6258]">
                        {line.detail}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-[#B5A197]">{line.at}</p>
                </div>
              </div>
            ),
          )}
          {typing ? (
            <div
              className="flex items-end gap-2"
              aria-label="Kynd is answering"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-[#FFF1E9] font-serif text-[10px] text-[#C75B39]">
                K
              </span>
              <p className="flex h-10 items-center gap-1 rounded-2xl rounded-bl-md border border-[#F4C9C0] bg-white px-3.5">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className={cn(
                      "size-1.5 rounded-full motion-safe:animate-bounce",
                      dot === 0 && "bg-[#FF7A59]",
                      dot === 1 && "bg-[#F2596F]",
                      dot === 2 && "bg-[#F0A13D]",
                    )}
                    style={{ animationDelay: `${dot * 140}ms` }}
                  />
                ))}
              </p>
            </div>
          ) : null}
        </div>

        <form
          className="flex items-center gap-2 border-t border-[#F2DACE] bg-white px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Ask about her</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask in a sentence"
              className="h-11 w-full rounded-full border border-[#F2DACE] bg-[#FFF7F1] px-4 text-sm text-[#3A2A25] placeholder:text-[#C4A99B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]"
            />
          </label>
          <button
            type="submit"
            aria-label="Send"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>

        {adding ? (
          <form
            onSubmit={addFact}
            className="flex gap-2 border-t border-[#F2DACE] bg-[#FFFBF8] px-3 py-3"
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">What you noticed</span>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Perfume"
                className="h-10 w-full rounded-full border border-[#F2DACE] bg-white px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]"
              />
            </label>
            <label className="min-w-0 flex-1">
              <span className="sr-only">The detail</span>
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="The one she mentioned"
                className="h-10 w-full rounded-full border border-[#F2DACE] bg-white px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]"
              />
            </label>
            <button
              type="submit"
              className="h-10 rounded-full bg-[#3A2A25] px-3 text-sm text-[#FFF7F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]"
            >
              Keep
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="border-t border-[#F2DACE] px-4 py-2 text-left text-xs text-[#92786C] hover:text-[#3A2A25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#F2596F]"
          >
            Keep something new
          </button>
        )}
      </section>
    </div>
  );
}
