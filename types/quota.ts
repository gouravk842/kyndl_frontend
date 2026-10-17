export type QuotaFeature = "memory_bank" | "kynd";

export type QuotaPack = {
  code: string;
  name: string;
  units: number;
  amount: number;
  currency: string;
  compare_at_amount?: number | null;
  offer_label?: string;
};

export type QuotaStatus = {
  feature: QuotaFeature;
  enabled: boolean;
  used: number;
  limit: number | null;
  free_units: number;
  purchased_units: number;
  packs: QuotaPack[];
};

export type QuotaCheckoutResponse = {
  checkout_id: string;
  product: {
    code: string;
    name: string;
    amount: number;
    currency: string;
    units: number;
    checkout_id: string;
  };
};
