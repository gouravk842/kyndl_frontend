"use client";

import { useDeluluMeterSync } from "@/hooks/use-delulu-meter-sync";

import { useBuilderStore } from "../../store/builder.store";
import { DeluluMeterExperience } from "../delulu-meter-experience";
import { BuilderPanel } from "./builder-panel";

export function DeluluMeterBuilder() {
  const sync = useDeluluMeterSync();
  const doc = useBuilderStore((s) => s.doc);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />
      <div className="h-1/2 flex-1 overflow-auto sm:h-full">
        <DeluluMeterExperience config={doc} className="min-h-full" />
      </div>
    </div>
  );
}
