"use client";

import { categoryLabel } from "@/features/kynd/lib/catalog";
import { cn } from "@/lib/utils";
import type { KyndItem } from "@/types/kynd";

const surface: Record<string, string> = {
  loves: "rounded-[1.6rem] bg-[#fff1ea] px-6 py-7 dark:bg-[#3a2623]",
  wants:
    "rounded-[1.6rem] bg-[#fbf6ee] px-6 py-7 ring-1 ring-[#e7d7c0] dark:bg-[#2c241c] dark:ring-white/10",
  dislikes: "rounded-2xl bg-[#f1ece6] px-5 py-5 dark:bg-[#241e1c]",
  food: "rounded-[1.35rem] bg-[#fff8f1] px-6 py-8 dark:bg-[#2a211c]",
  details: "bg-transparent px-1 py-3",
  places: "rounded-[1.6rem] bg-[#f3f0ea] px-6 py-8 dark:bg-[#26201c]",
  said: "bg-transparent px-1 py-5",
  other: "rounded-[1.6rem] bg-white/75 px-6 py-7 dark:bg-white/5",
  "": "rounded-[1.6rem] bg-white/75 px-6 py-7 dark:bg-white/5",
};

export function KyndCard({
  item,
  lead = false,
  onEdit,
}: {
  item: KyndItem;
  lead?: boolean;
  onEdit: (item: KyndItem) => void;
}) {
  const kind = item.category || "";
  const label = categoryLabel(kind);
  const said = kind === "said";
  const details = kind === "details";
  const excerpt = (item.title || item.body).slice(0, 80);

  return (
    <article
      id={`item-${item.id}`}
      className={cn(
        "group relative scroll-mt-24",
        surface[kind] ?? surface[""],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {label && !said ? (
          <p className="text-[11px] tracking-[0.18em] text-[#8a7064] uppercase dark:text-[#c4aa9c]">
            {label}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="min-h-11 shrink-0 rounded-full px-2 text-sm text-[#6b564c] opacity-100 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 dark:text-[#cbb8ad]"
        >
          <span className="sr-only">Edit {excerpt}</span>
          <span aria-hidden>Edit</span>
        </button>
      </div>

      {item.title && !details ? (
        <h3
          className={cn(
            "font-serif leading-tight text-balance",
            lead ? "text-3xl" : "text-2xl",
          )}
        >
          {item.title}
        </h3>
      ) : null}

      {details && item.title ? (
        <p className="text-[11px] tracking-[0.18em] text-[#8a7064] uppercase dark:text-[#c4aa9c]">
          {item.title}
        </p>
      ) : null}

      {item.body ? (
        <p
          className={cn(
            "wrap-anywhere whitespace-pre-wrap",
            said && "font-serif text-[1.65rem] leading-snug italic",
            details && "font-serif text-3xl leading-tight",
            !said &&
              !details &&
              item.title &&
              "mt-3 text-base leading-relaxed text-[#4e3d36] dark:text-[#e6d7cf]",
            !said &&
              !details &&
              !item.title &&
              "font-serif text-2xl leading-snug",
            kind === "dislikes" && "text-[#5c4a43] dark:text-[#d5c4ba]",
          )}
        >
          {said ? `“${item.body}”` : item.body}
        </p>
      ) : null}
    </article>
  );
}
