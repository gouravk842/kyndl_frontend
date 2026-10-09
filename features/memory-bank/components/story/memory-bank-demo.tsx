"use client";

import {
  BookOpen,
  Calendar,
  Film,
  Frame,
  type LucideIcon,
  MapPin,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Day = {
  title: string;
  note: string;
  date: string;
  place: string;
  photo: boolean;
  wash: string;
  ink: string;
};

const DAYS: Day[] = [
  {
    title: "Rainy Tuesday",
    note: "We stayed in.",
    date: "12 Mar",
    place: "",
    photo: false,
    wash: "#DCEAD6",
    ink: "#3E5C42",
  },
  {
    title: "Kitchen laugh",
    note: "She was at the stove.",
    date: "2 Apr",
    place: "Home",
    photo: false,
    wash: "#FBD3DE",
    ink: "#8E1020",
  },
  {
    title: "Train home",
    note: "Half asleep by the window.",
    date: "18 May",
    place: "The 6:40",
    photo: true,
    wash: "#FDE7B8",
    ink: "#8A5410",
  },
  {
    title: "Rooftop",
    note: "After the lights came on.",
    date: "9 Jun",
    place: "Our roof",
    photo: true,
    wash: "#FFD5C8",
    ink: "#C24B32",
  },
  {
    title: "That song",
    note: "It played all evening.",
    date: "21 Jul",
    place: "",
    photo: false,
    wash: "#F7C9D8",
    ink: "#A33B5C",
  },
  {
    title: "At the door",
    note: "Come back soon.",
    date: "3 Aug",
    place: "",
    photo: false,
    wash: "#F3D7B0",
    ink: "#8A5A22",
  },
];

const FEATURES: {
  id: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
  wash: string;
  ink: string;
}[] = [
  {
    id: "memory-pages",
    label: "Memory Pages",
    blurb: "A page-turning album of titles, notes, and photos.",
    icon: BookOpen,
    wash: "#FBD3DE",
    ink: "#8E1020",
  },
  {
    id: "constellation",
    label: "Constellation",
    blurb: "A night sky. Each memory is a star you can open.",
    icon: Sparkles,
    wash: "#E7E4F6",
    ink: "#4A3D78",
  },
  {
    id: "memory-jar",
    label: "Memory Jar",
    blurb: "Folded notes. A title is enough.",
    icon: ScrollText,
    wash: "#FDE7B8",
    ink: "#8A5410",
  },
  {
    id: "our-places",
    label: "Our Places",
    blurb: "A map of the memories that already have a place.",
    icon: MapPin,
    wash: "#DCEAD6",
    ink: "#3E5C42",
  },
  {
    id: "relationship-calendar",
    label: "Relationship Calendar",
    blurb: "One day on a calendar for each memory that has a date.",
    icon: Calendar,
    wash: "#FFD5C8",
    ink: "#C24B32",
  },
  {
    id: "string-frame",
    label: "String Frame",
    blurb: "Photos pinned on a string. Days without a photo stay in the bank.",
    icon: Frame,
    wash: "#F3D7B0",
    ink: "#8A5A22",
  },
  {
    id: "timeless-treasure",
    label: "Timeless Treasure",
    blurb: "A film strip. Only memories with a photo become frames.",
    icon: Film,
    wash: "#F7C9D8",
    ink: "#A33B5C",
  },
];

export function MemoryBankDemo() {
  const [featureId, setFeatureId] = useState(FEATURES[0]?.id ?? "memory-pages");
  const feature = FEATURES.find((item) => item.id === featureId) ?? FEATURES[0];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#C75B39] uppercase">
          One bank
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          The days, kept together.
        </h2>
        <ul className="mt-6 space-y-3">
          {DAYS.map((day) => (
            <li
              key={day.title}
              className="rounded-2xl px-4 py-3"
              style={{ background: day.wash, color: day.ink }}
            >
              <p className="font-serif text-xl leading-tight">{day.title}</p>
              <p className="mt-1 text-sm opacity-80">
                {day.date}
                {day.place ? ` · ${day.place}` : ""}
                {day.photo ? " · Photo" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#C75B39] uppercase">
          Then choose
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          The same days, as any keepsake.
        </h2>
        <div
          role="group"
          aria-label="Keepsakes a bank can become"
          className="mt-5 flex flex-wrap gap-2"
        >
          {FEATURES.map((item) => {
            const Icon = item.icon;
            const on = item.id === feature?.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFeatureId(item.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F]",
                  on
                    ? "text-[#3A2A25] ring-2 ring-[#C75B39]"
                    : "text-[#5c4a43]",
                )}
                style={{ background: item.wash }}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>

        {feature ? (
          <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-[#E7D3B0] bg-white shadow-[0_24px_50px_-28px_rgba(240,161,61,0.4)]">
            <div
              className="px-5 py-4"
              style={{ background: feature.wash, color: feature.ink }}
            >
              <p className="font-serif text-2xl leading-tight">
                {feature.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{feature.blurb}</p>
            </div>
            <div className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFF3F0_100%)] px-5 py-5">
              <Preview id={feature.id} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Preview({ id }: { id: string }) {
  if (id === "constellation") return <Sky />;
  if (id === "memory-jar") return <Jar />;
  if (id === "our-places") return <Places />;
  if (id === "relationship-calendar") return <Dates />;
  if (id === "string-frame" || id === "timeless-treasure")
    return <Photos id={id} />;
  return <Pages />;
}

function Pages() {
  const open = DAYS[0];
  if (!open) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-2xl bg-white px-4 py-4 shadow-sm">
        <p className="text-[11px] tracking-[0.16em] text-[#C75B39] uppercase">
          {open.date}
        </p>
        <h3 className="mt-2 font-serif text-2xl">{open.title}</h3>
        <p className="mt-2 text-sm text-[#5c4a43]">{open.note}</p>
      </article>
      <ul className="space-y-2">
        {DAYS.slice(1, 4).map((day) => (
          <li
            key={day.title}
            className="rounded-xl px-3 py-2 text-sm"
            style={{ background: day.wash, color: day.ink }}
          >
            {day.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sky() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {DAYS.map((day) => (
        <li
          key={day.title}
          className="rounded-2xl bg-[#2C2438] px-3 py-4 text-center text-[#F6EFE9]"
        >
          <span className="mx-auto block size-2 rounded-full bg-[#F0A13D]" />
          <span className="mt-2 block font-serif text-lg leading-tight">
            {day.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Jar() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {DAYS.map((day) => (
        <li
          key={day.title}
          className="rounded-b-2xl rounded-t-md px-3 py-4"
          style={{ background: day.wash, color: day.ink }}
        >
          <p className="font-serif text-lg leading-tight">{day.title}</p>
          <p className="mt-1 text-xs opacity-80">{day.note}</p>
        </li>
      ))}
    </ul>
  );
}

function Places() {
  const placed = DAYS.filter((day) => day.place);
  return (
    <div>
      <ul className="space-y-2">
        {placed.map((day) => (
          <li
            key={day.title}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
          >
            <span>
              <span className="block font-serif text-lg">{day.place}</span>
              <span className="text-sm text-[#5c4a43]">{day.title}</span>
            </span>
            <MapPin className="size-4 shrink-0 text-[#3E5C42]" aria-hidden />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-[#7A6258]">
        Days without a place stay in the bank.
      </p>
    </div>
  );
}

function Dates() {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {DAYS.map((day) => (
        <li
          key={day.title}
          className="rounded-2xl px-3 py-3"
          style={{ background: day.wash, color: day.ink }}
        >
          <p className="text-[11px] tracking-[0.14em] uppercase">{day.date}</p>
          <p className="mt-1 font-serif text-lg leading-tight">{day.title}</p>
        </li>
      ))}
    </ul>
  );
}

function Photos({ id }: { id: string }) {
  const photos = DAYS.filter((day) => day.photo);
  const film = id === "timeless-treasure";
  return (
    <div>
      <ul className={cn("flex gap-3", film && "rounded-xl bg-[#2C2420] p-3")}>
        {photos.map((day) => (
          <li
            key={day.title}
            className={cn(
              "min-w-0 flex-1 px-3 py-4 text-center",
              film ? "bg-[#F6EFE9] text-[#3A2A25]" : "rounded-2xl bg-white",
            )}
          >
            <span
              className="mx-auto block h-16 w-full rounded-md"
              style={{ background: day.wash }}
            />
            <span className="mt-2 block font-serif text-base leading-tight">
              {day.title}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-[#7A6258]">
        Days without a photo stay in the bank.
      </p>
    </div>
  );
}
