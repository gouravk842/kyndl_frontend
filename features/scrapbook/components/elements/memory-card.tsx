import type { MemoryCardVariant } from "@/features/scrapbook/types";
import { cn } from "@/lib/utils";

type MemoryCardProps = {
  body: string;
  date?: string;
  place?: string;
  variant?: MemoryCardVariant;
};

const surfaces: Record<MemoryCardVariant, string> = {
  sticky: "bg-[#fff5b8] text-[#5b4a1f]",
  torn: "bg-[#fdf6ea] text-[#4a3a2f]",
  journal: "bg-[#fbf3e6] text-[#4a3a2f]",
};

/**
 * A small paper snippet — sticky note, torn scrap, or journal entry — holding
 * a date, place, and a remembered moment.
 */
export function MemoryCard({
  body,
  date,
  place,
  variant = "journal",
}: MemoryCardProps) {
  const torn = variant === "torn";
  return (
    <div
      className={cn(
        "kyndl-pinned w-56 px-4 py-3",
        surfaces[variant],
        variant === "sticky" && "rounded-[2px]",
        variant === "journal" &&
          "rounded-[2px] border-l-2 border-[#d9b27a] bg-[linear-gradient(transparent_1.45rem,rgba(146,120,108,0.18)_1.5rem)] bg-[size:100%_1.5rem]",
      )}
      style={
        torn
          ? {
              clipPath:
                "polygon(0 4%, 8% 0, 22% 5%, 38% 1%, 55% 6%, 72% 1%, 90% 5%, 100% 2%, 99% 96%, 88% 100%, 70% 95%, 52% 100%, 34% 96%, 16% 100%, 2% 95%)",
            }
          : undefined
      }
    >
      {(date || place) && (
        <p className="mb-1 font-hand text-base leading-none text-[#9a7a4a]">
          {[date, place].filter(Boolean).join(" · ")}
        </p>
      )}
      <p
        className={cn(
          "leading-snug",
          variant === "journal" ? "font-hand text-lg" : "text-sm font-medium",
        )}
      >
        {body}
      </p>
    </div>
  );
}
