"use client";

import { useDateAskSync } from "@/hooks/use-date-ask-sync";

import { useDateAskBuilder } from "../../store/date-ask.store";
import { MomentBuilder } from "./moment-builder";

export function DateAskBuilder() {
  const sync = useDateAskSync();
  return <MomentBuilder store={useDateAskBuilder} sync={sync} kind="date-ask" />;
}
