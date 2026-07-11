"use client";

import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { hasRedZoneConsent, setRedZoneConsent } from "@/lib/red-zone-consent";
import { cn } from "@/lib/utils";

import { AgeConsentDialog } from "./age-consent-dialog";

/**
 * The header entry into the Red Zone. Clicking asks for 18+ consent the first
 * time (remembered on-device); once consented it goes straight to the section.
 */
export function RedZoneNavLink({ className }: { className?: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  const onClick = () => {
    if (hasRedZoneConsent()) {
      router.push(ROUTES.redZone);
    } else {
      setAsking(true);
    }
  };

  const onConfirm = () => {
    setRedZoneConsent();
    setAsking(false);
    router.push(ROUTES.redZone);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium text-[#C2415A] transition-colors duration-300 hover:text-[#9e1f3c]",
          className,
        )}
      >
        <Flame className="size-3.5" />
        Red Zone
      </button>
      <AgeConsentDialog
        open={asking}
        onConfirm={onConfirm}
        onCancel={() => setAsking(false)}
      />
    </>
  );
}
