"use client";

import { KyndButton } from "@/features/kynd/components/kynd-button";
import {
  KYND_CATEGORIES,
  littleThingsLabel,
  monogram,
  relationshipLabel,
} from "@/features/kynd/lib/catalog";
import { cn } from "@/lib/utils";
import type { KyndItem, KyndPerson } from "@/types/kynd";

const TONE: Record<string, { wash: string; ink: string; line: string }> = {
  loves: { wash: "#FBD3DE", ink: "#8E1020", line: "#F2596F" },
  wants: { wash: "#FDE7B8", ink: "#8A5410", line: "#F0A13D" },
  dislikes: { wash: "#E7E0DA", ink: "#5C4A43", line: "#92786C" },
  food: { wash: "#FFD5C8", ink: "#C24B32", line: "#FF7A59" },
  details: { wash: "#F3D7B0", ink: "#8A5A22", line: "#D4A373" },
  places: { wash: "#DCEAD6", ink: "#3E5C42", line: "#6E8B6A" },
  said: { wash: "#F7C9D8", ink: "#A33B5C", line: "#E07A92" },
  other: { wash: "#FFE4F1", ink: "#8E3A62", line: "#E07A92" },
};

const PEOPLE_WASH = [
  "#FBD3DE",
  "#FDE7B8",
  "#FFD5C8",
  "#DCEAD6",
  "#F7C9D8",
  "#F3D7B0",
];

const FALLBACK = TONE.other ?? {
  wash: "#FFE4F1",
  ink: "#8E3A62",
  line: "#E07A92",
};

function tone(category: string) {
  return TONE[category] ?? FALLBACK;
}

export function KyndGraph({
  people,
  person,
  items,
  loading,
  lit,
  onSelectPerson,
  onAdd,
  onEdit,
  onEditPerson,
  onAsk,
  hasMore,
  loadingMore,
  onMore,
}: {
  people: KyndPerson[];
  person: KyndPerson | null;
  items: KyndItem[];
  loading: boolean;
  lit: Set<string>;
  onSelectPerson: (id: string) => void;
  onAdd: () => void;
  onEdit: (item: KyndItem) => void;
  onEditPerson: () => void;
  onAsk: (item: KyndItem) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onMore: () => void;
}) {
  const groups = KYND_CATEGORIES.map((option) => ({
    ...option,
    tone: tone(option.value),
    items: items.filter((item) => (item.category || "other") === option.value),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-serif text-3xl leading-tight">
            {person ? person.name : "Everyone you keep"}
          </h2>
          <p className="mt-1 text-sm text-[#6b564c] dark:text-[#cbb8ad]">
            {person
              ? `${relationshipLabel(person.relationship_type)} · ${littleThingsLabel(person.item_count)}`
              : "Choose someone to see what you know."}
          </p>
        </div>
        {person ? (
          <div className="flex flex-wrap items-center gap-2">
            <KyndButton type="button" onClick={onAdd}>
              Add a little thing
            </KyndButton>
            <button
              type="button"
              onClick={onEditPerson}
              className="min-h-11 rounded-full px-3 text-sm text-[#5c4a43] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:text-[#cbb8ad]"
            >
              Edit name
            </button>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {!person ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {people.map((row, index) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelectPerson(row.id)}
                  className="flex w-full items-center gap-4 rounded-3xl px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]"
                  style={{
                    background: PEOPLE_WASH[index % PEOPLE_WASH.length],
                    color: "#3A2A25",
                  }}
                >
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/70 font-serif text-2xl">
                    {monogram(row.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-2xl leading-tight">
                      {row.name}
                    </span>
                    <span className="mt-1 block text-sm text-[#5c4a43]">
                      {relationshipLabel(row.relationship_type)}
                      <span aria-hidden> · </span>
                      {littleThingsLabel(row.item_count)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {person && loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
            <div className="h-36 animate-pulse rounded-3xl bg-[#FBD3DE] motion-reduce:animate-none" />
            <div className="h-36 animate-pulse rounded-3xl bg-[#FDE7B8] motion-reduce:animate-none" />
          </div>
        ) : null}

        {person && !loading && items.length === 0 ? (
          <div className="rounded-3xl bg-[#FBD3DE] px-6 py-10 text-[#8E1020]">
            <p className="font-serif text-3xl leading-tight">
              Nothing kept about {person.name} yet.
            </p>
            <p className="mt-2 max-w-md text-sm">
              A lipstick shade, a shoe size, the restaurant they loved.
            </p>
            <KyndButton type="button" className="mt-6" onClick={onAdd}>
              Add the first one
            </KyndButton>
          </div>
        ) : null}

        {person && groups.length > 0 ? (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.value} aria-label={group.label}>
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ background: group.tone.line }}
                  />
                  {group.label}
                  <span className="text-[#8a7064]">{group.items.length}</span>
                </h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <FactCard
                        item={item}
                        tone={group.tone}
                        lit={lit.has(item.id)}
                        onEdit={() => onEdit(item)}
                        onAsk={() => onAsk(item)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}

        {hasMore ? (
          <button
            type="button"
            onClick={onMore}
            disabled={loadingMore}
            className="mt-6 min-h-11 rounded-full px-3 text-sm text-[#5c4a43] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] disabled:opacity-50"
          >
            {loadingMore ? "Looking…" : "More little things"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FactCard({
  item,
  tone: paint,
  lit,
  onEdit,
  onAsk,
}: {
  item: KyndItem;
  tone: { wash: string; ink: string; line: string };
  lit: boolean;
  onEdit: () => void;
  onAsk: () => void;
}) {
  const headline = item.title || item.body;
  const detail = item.title && item.body ? item.body : "";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-3xl px-4 py-4",
        lit && "ring-2 ring-[#F0A13D] ring-offset-2 ring-offset-[#f6f0e9]",
      )}
      style={{ background: paint.wash, color: paint.ink }}
    >
      <h4 className="font-serif text-2xl leading-tight wrap-anywhere">
        {headline}
      </h4>
      {detail ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed wrap-anywhere opacity-80">
          {detail}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-11 rounded-full bg-white/80 px-4 text-sm text-[#2c2420] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onAsk}
          className="min-h-11 rounded-full px-4 text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]"
        >
          Ask
        </button>
      </div>
    </article>
  );
}
