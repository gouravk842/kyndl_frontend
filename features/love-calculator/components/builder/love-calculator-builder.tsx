"use client";

import { useLoveCalculatorSync } from "@/hooks/use-love-calculator-sync";

import { useBuilderStore } from "../../store/builder.store";
import { LoveCalculatorExperience } from "../love-calculator-experience";
import { BuilderPanel } from "./builder-panel";

export function LoveCalculatorBuilder() {
  const sync = useLoveCalculatorSync();
  const doc = useBuilderStore((s) => s.doc);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />
      <div className="h-1/2 flex-1 overflow-auto sm:h-full">
        <LoveCalculatorExperience config={doc} className="min-h-full" />
      </div>
    </div>
  );
}
