import type { DecorationType } from "@/features/scrapbook/types";
import { cn } from "@/lib/utils";

type DecorationProps = {
  type: DecorationType;
  label?: string;
  color?: string;
};

/**
 * Layered decorative elements: washi tape, hearts, stars, flowers, travel
 * stamps, and ticket stubs. Each feels stuck onto the page.
 */
export function Decoration({ type, label, color }: DecorationProps) {
  switch (type) {
    case "washi":
      return (
        <div
          className="kyndl-tape h-7 w-28 rotate-[var(--r)] opacity-90"
          style={{ backgroundColor: color ?? "#f7b6a3" }}
          aria-hidden
        />
      );

    case "heart":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9 drop-shadow-sm" aria-hidden>
          <path
            d="M12 21s-7.5-4.6-10-9.2C.3 8.7 1.8 5 5.2 5 7.3 5 8.7 6.3 12 8.7 15.3 6.3 16.7 5 18.8 5c3.4 0 4.9 3.7 3.2 6.8C19.5 16.4 12 21 12 21z"
            fill={color ?? "#f2596f"}
          />
        </svg>
      );

    case "star":
      return (
        <svg viewBox="0 0 24 24" className="h-8 w-8 drop-shadow-sm" aria-hidden>
          <path
            d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
            fill={color ?? "#f0a13d"}
          />
        </svg>
      );

    case "flower":
      return (
        <svg viewBox="0 0 24 24" className="h-9 w-9 drop-shadow-sm" aria-hidden>
          <g fill={color ?? "#ff9a7b"}>
            <circle cx="12" cy="6" r="3.2" />
            <circle cx="18" cy="12" r="3.2" />
            <circle cx="12" cy="18" r="3.2" />
            <circle cx="6" cy="12" r="3.2" />
          </g>
          <circle cx="12" cy="12" r="2.6" fill="#f0a13d" />
        </svg>
      );

    case "stamp":
      return (
        <div
          className="flex h-14 w-16 items-center justify-center rounded-[2px] border border-[#9a6f5a] bg-[#f3e3cf] text-center"
          style={{
            maskImage:
              "radial-gradient(circle at 2px 2px, transparent 2px, #000 2.2px)",
            maskSize: "8px 8px",
            WebkitMaskImage:
              "radial-gradient(circle at 2px 2px, transparent 2px, #000 2.2px)",
            WebkitMaskSize: "8px 8px",
          }}
          aria-hidden
        >
          <span className="font-mono text-[10px] font-bold tracking-wide text-[#7a4f3a]">
            {label ?? "POST"}
          </span>
        </div>
      );

    case "ticket":
      return (
        <div
          className={cn(
            "kyndl-pinned flex h-10 items-center gap-2 rounded-[3px] bg-[#fce7c8] px-3",
          )}
          style={{
            backgroundImage:
              "radial-gradient(circle at left center, transparent 5px, #fce7c8 5px), radial-gradient(circle at right center, transparent 5px, #fce7c8 5px)",
          }}
          aria-hidden
        >
          <span className="text-base">🎟️</span>
          <span className="font-mono text-[10px] font-semibold tracking-widest text-[#8a5a2a]">
            {label ?? "ADMIT ONE"}
          </span>
        </div>
      );

    default:
      return null;
  }
}
