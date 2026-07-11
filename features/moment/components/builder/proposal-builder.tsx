"use client";

import { useProposalSync } from "@/hooks/use-proposal-sync";

import { useProposalBuilder } from "../../store/proposal.store";
import { MomentBuilder } from "./moment-builder";

export function ProposalBuilder() {
  const sync = useProposalSync();
  return <MomentBuilder store={useProposalBuilder} sync={sync} kind="proposal" />;
}
