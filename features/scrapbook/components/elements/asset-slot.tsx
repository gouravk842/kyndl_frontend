import { cn } from "@/lib/utils";

type AssetKind = "photo" | "audio" | "video";

const labels: Record<AssetKind, string> = {
  photo: "Add a photo",
  audio: "Add an audio clip",
  video: "Add a video clip",
};

const icons: Record<AssetKind, string> = {
  photo: "🖼️",
  audio: "🎙️",
  video: "🎞️",
};

/**
 * Placeholder shown wherever a real asset hasn't been dropped into
 * `public/scrapbook/` yet. Clearly marked so it's obvious where to fill in.
 */
export function AssetSlot({
  kind,
  hint,
  className,
}: {
  kind: AssetKind;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 rounded-[3px] border-2 border-dashed border-[#caa98f] bg-[#fbf2e6]/70 p-4 text-center",
        className,
      )}
    >
      <span className="text-2xl opacity-70" aria-hidden>
        {icons[kind]}
      </span>
      <span className="font-hand text-base leading-tight text-[#9a7d6a]">
        {labels[kind]}
      </span>
      {hint ? (
        <span className="text-[10px] tracking-wide text-[#b29a89]">{hint}</span>
      ) : null}
    </div>
  );
}
