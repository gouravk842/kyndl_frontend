/**
 * Canonical schedule/unlock parity fixture — keep in sync with
 * `kyndl_backend/experiences/tests/test_twenty_four_reasons.py`.
 *
 * Note: JS `toISOString()` emits UTC (`…Z`). The backend fixture stores
 * offset-form IST strings that are the *same instants*. Compare via Date.parse.
 */

import type { Reason } from "../config";
import { deriveUnlockAts } from "./schedule";
import { partitionReasons } from "./unlock";

export const PARITY_ANCHOR = "2026-08-01T00:00:00+05:30";
export const PARITY_INTERVAL_HOURS = 1;

/** Expected unlock instants (ms) for reasons 1–4 from the shared anchor. */
export const PARITY_UNLOCK_MS = [
  Date.parse("2026-08-01T00:00:00+05:30"),
  Date.parse("2026-08-01T01:00:00+05:30"),
  Date.parse("2026-08-01T02:00:00+05:30"),
  Date.parse("2026-08-01T03:00:00+05:30"),
];

export function parityReasons(): Reason[] {
  const unlockAts = deriveUnlockAts(PARITY_ANCHOR, PARITY_INTERVAL_HOURS, 4);
  return unlockAts.map((unlockAt, i) => ({
    id: `r${i + 1}`,
    n: i + 1,
    label: "",
    message: `Reason ${i + 1}`,
    image: null,
    audio: null,
    unlockAt,
    teaser: "",
  }));
}

/** Mid-morning IST Aug 1 → r1–r3 open, r4 locked. */
export const PARITY_NOW_MS = Date.parse("2026-08-01T02:30:00+05:30");

/** Throws if schedule/unlock drift from the locked parity expected shape. */
export function assertScheduleParity(): void {
  const ats = deriveUnlockAts(PARITY_ANCHOR, PARITY_INTERVAL_HOURS, 4);
  const gotMs = ats.map((s) => Date.parse(s));
  for (let i = 0; i < PARITY_UNLOCK_MS.length; i++) {
    if (gotMs[i] !== PARITY_UNLOCK_MS[i]) {
      throw new Error(
        `Schedule parity failed at index ${i}: expected ${PARITY_UNLOCK_MS[i]}, got ${gotMs[i]} (${ats[i]})`,
      );
    }
  }

  const { open, locked } = partitionReasons(parityReasons(), PARITY_NOW_MS);
  const openIds = open.map((r) => r.id).join(",");
  const lockedIds = locked.map((r) => r.id).join(",");
  if (openIds !== "r1,r2,r3" || lockedIds !== "r4") {
    throw new Error(
      `Unlock parity failed: open=${openIds} locked=${lockedIds}`,
    );
  }
}
