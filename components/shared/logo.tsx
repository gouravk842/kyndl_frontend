import Link from "next/link";

import { KyndlLogo, type KyndlLogoSize } from "@/components/shared/kyndl-logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: KyndlLogoSize;
}

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <Link
      href={ROUTES.home}
      className={cn("inline-flex items-center", className)}
      aria-label="Kyndl home"
    >
      <KyndlLogo size={size} />
    </Link>
  );
}
