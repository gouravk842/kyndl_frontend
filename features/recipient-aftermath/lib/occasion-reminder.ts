import { track } from "@/services/analytics/analytics.service";

/**
 * Seed for a future referral / occasion-reminder job.
 *
 * Companion recommendations already exist (`POST /recommendations/post-purchase/`,
 * `CompanionRecommendations`). When we schedule reminders (Celery + email),
 * hydrate the message from this seed and render the same companion rail —
 * opposite-channel bias included. Do not invent a second ranker.
 */
export type OccasionReminderSeed = {
  experienceType: string;
  fromToken: string;
  triggeredBy: "make_one_back" | "reaction" | "share_open";
};

/**
 * Capture intent so we can wire scheduled companion-rec reminders later.
 * Today: analytics only. Tomorrow: enqueue reminder with this payload.
 */
export function captureOccasionReminderIntent(
  seed: OccasionReminderSeed,
): void {
  track({
    name: "share.reminder_intent",
    properties: {
      experience_type: seed.experienceType,
      from_token: seed.fromToken,
      triggered_by: seed.triggeredBy,
    },
  });
}
