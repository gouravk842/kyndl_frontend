export type ReferralProfile = {
  code: string;
  is_active: boolean;
  click_count: number;
  conversion_count: number;
  pending_credit_paise: number;
  issued_credit_paise: number;
  created_at: string;
};

export type ReferralLinkItem = {
  kind: "experience" | "gift";
  slug: string;
  name: string;
  url: string;
};

export type ReferralLinksPayload = {
  code: string;
  general_url: string;
  experiences: ReferralLinkItem[];
  gifts: ReferralLinkItem[];
};

export type ReferralRewardBrief = {
  id: string;
  amount_paise: number;
  status: "pending" | "issued" | "void";
  issued_at: string | null;
  created_at: string;
};

export type ReferralConversion = {
  id: string;
  amount_paise: number;
  currency: string;
  target_kind: string;
  target_slug: string;
  status: string;
  created_at: string;
  reward: ReferralRewardBrief | null;
};
