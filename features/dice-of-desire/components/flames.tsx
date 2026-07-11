import { Flame } from "lucide-react";

import { type Heat, HEAT_META } from "../config";

/** A row of flames showing a heat tier's intensity (1–4), tinted to the tier. */
export function Flames({
  heat,
  className,
}: {
  heat: Heat;
  className?: string;
}) {
  const meta = HEAT_META[heat];
  return (
    <span
      className={["inline-flex items-center gap-0.5", className ?? ""].join(" ")}
      aria-label={`${meta.label} — ${meta.flames} of 4`}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Flame
          key={i}
          className="size-3.5"
          style={{
            color: i < meta.flames ? meta.accent : "rgba(255,255,255,0.18)",
            fill: i < meta.flames ? meta.accent : "transparent",
          }}
        />
      ))}
    </span>
  );
}
