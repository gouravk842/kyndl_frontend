import { SAMPLE_PROPOSAL } from "../config";
import { createMomentBuilder } from "./create-builder-store";

/** Proposal builder store — seeded from the sample so it's never an empty void. */
export const useProposalBuilder = createMomentBuilder(
  "kyndl:proposal-builder",
  () => structuredClone(SAMPLE_PROPOSAL),
);
