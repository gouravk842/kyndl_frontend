import * as React from "react";

/**
 * The cream letter-sheet card that carries every auth form — a single sheet
 * with two more peeking out behind it (via `.kyndl-letter-stack`), a soft
 * paper grain, and a letterpressed serif title.
 */
export function AuthSheet({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="kyndl-letter-stack relative w-full rounded-[1.6rem] bg-[#FBF4E8] px-7 py-9 shadow-[0_30px_64px_-30px_rgba(58,42,37,0.55)] ring-1 ring-[#e9d9c2] sm:px-10 sm:py-10">
      <div
        className="kyndl-paper-grain pointer-events-none absolute inset-0 rounded-[1.6rem] opacity-50"
        aria-hidden
      />
      <div className="relative">
        <h1 className="kyndl-letterpress text-center font-serif text-[2rem] leading-tight text-[#3A2A25]">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-[14.5px] leading-relaxed text-[#8a7669]">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
