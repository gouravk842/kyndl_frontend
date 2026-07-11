import { SAMPLE_DATE_ASK } from "../config";
import { createMomentBuilder } from "./create-builder-store";

/** Date-ask builder store — seeded from the sample so it's never an empty void. */
export const useDateAskBuilder = createMomentBuilder(
  "kyndl:date-ask-builder",
  () => structuredClone(SAMPLE_DATE_ASK),
);
