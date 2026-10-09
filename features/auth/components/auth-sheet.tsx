import * as React from "react";

/**
 * Soft cream card that carries every auth form — sized to sit inside the
 * desktop viewport without scrolling.
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
    <div className="kyndl-card-soft relative w-full rounded-[1.75rem] border border-[#F4DDD0] bg-white px-6 py-7 sm:px-8 sm:py-8 lg:flex lg:h-full lg:flex-col lg:justify-center lg:px-8 lg:py-7">
      <div className="relative">
        <h1 className="text-center font-display text-[1.75rem] leading-tight text-[#3A2A25] lg:text-[1.85rem]">
          {title}
        </h1>
        <p className="mx-auto mt-1.5 max-w-xs text-center text-sm leading-relaxed text-[#7A6258]">
          {description}
        </p>
        <div className="mt-6 lg:mt-5">{children}</div>
      </div>
    </div>
  );
}
