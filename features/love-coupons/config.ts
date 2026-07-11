/**
 * Love Coupons — content & types (Red Zone, adults only).
 *
 * A digital booklet of redeemable coupons — the customizable, never-runs-out
 * answer to a physical love-coupon book. The partner opens the link, picks a
 * coupon, and taps Redeem; the owner gets pinged to make good on it. Heat tiers
 * and styling are shared with the rest of the Red Zone.
 */

import { type Heat, HEAT_META, HEAT_ORDER } from "@/features/desire-deck/config";

export { type Heat, HEAT_META, HEAT_ORDER };

export type Coupon = {
  id: string;
  heat: Heat;
  title: string;
  /** The fine print — what the coupon actually gets them. */
  description: string;
};

export type CouponBook = {
  recipientName: string;
  ownerName: string;
  title: string;
  intro: string;
  coupons: Coupon[];
};

export const COUPON_BOOK: CouponBook = {
  recipientName: "you",
  ownerName: "me",
  title: "Your coupon book",
  intro:
    "No expiry, no limits, no excuses. Tear one out whenever you want it — I'm good for every single one.",
  coupons: [
    {
      id: "c1",
      heat: "sweet",
      title: "One slow dance",
      description: "Right now, wherever we are. I pick the song.",
    },
    {
      id: "c2",
      heat: "sweet",
      title: "Breakfast in bed",
      description: "You don't move a muscle. I bring it all to you.",
    },
    {
      id: "c3",
      heat: "flirty",
      title: "A full-body massage",
      description: "Oil, candles, the works. As long as you like.",
    },
    {
      id: "c4",
      heat: "flirty",
      title: "A striptease",
      description: "Your song, my moves. No laughing (okay, some laughing).",
    },
    {
      id: "c5",
      heat: "spicy",
      title: "Your choice tonight",
      description: "Anything you want — you're completely in charge.",
    },
    {
      id: "c6",
      heat: "wild",
      title: "One fantasy, fulfilled",
      description: "Tell me the one you've been thinking about. We do it.",
    },
  ],
};
