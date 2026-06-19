import { kyndlLogoSvg } from "@/lib/kyndl-logo-svg";
import { cn } from "@/lib/utils";

export const KYNDL_LOGO_SRC = "/logo.svg";

function applyStaticMode(svg: string) {
  return svg.replace("<svg ", '<svg class="kyndl-logo--static" ');
}

const sizeMap = {
  sm: "h-8 w-[94px]",
  md: "h-10 w-[117px]",
  lg: "h-14 w-[164px]",
  loader: "h-[150px] w-[175px]",
} as const;

export type KyndlLogoSize = keyof typeof sizeMap;

interface KyndlLogoProps {
  className?: string;
  size?: KyndlLogoSize;
  /** Play the built-in SVG entrance animation (loader). */
  animated?: boolean;
}

export function KyndlLogo({
  className,
  size = "md",
  animated = false,
}: KyndlLogoProps) {
  const markup = animated ? kyndlLogoSvg : applyStaticMode(kyndlLogoSvg);

  return (
    <div
      role="img"
      aria-label="Kyndl"
      className={cn(
        "inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-full",
        sizeMap[size],
        className,
      )}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
