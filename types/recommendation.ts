export type RecommendationKind = "digital" | "physical";

export type Occasion =
  | "anniversary"
  | "birthday"
  | "proposal"
  | "just_because"
  | "long_distance"
  | "make_up"
  | "first_date"
  | "valentine"
  | "festival";

export type RelationshipStage =
  | "crush"
  | "dating"
  | "engaged"
  | "married"
  | "long_distance";

export type ChannelPref = "digital" | "physical" | "either";

export type Vibe =
  | "romantic"
  | "playful"
  | "sentimental"
  | "adventurous"
  | "intimate";

export type LoveLanguage = "words" | "time" | "gifts" | "acts" | "touch";

export type Timeline = "tonight" | "this_week" | "planned" | "anniversary_date";

export type GiftSize = "small_gesture" | "medium" | "grand";

export type BudgetTier = "under_299" | "299_799" | "799_1499" | "1500_plus";

export type RecipientInterest =
  | "music"
  | "travel"
  | "photos"
  | "games"
  | "food"
  | "stars"
  | "writing"
  | "surprise";

export interface QuizAnswers {
  occasion?: Occasion | "";
  relationship_stage?: RelationshipStage | "";
  budget_tier?: BudgetTier | "";
  channel_pref?: ChannelPref;
  vibe?: Vibe | "";
  love_language?: LoveLanguage | "";
  recipient_interests?: RecipientInterest[];
  timeline?: Timeline | "";
  gift_size?: GiftSize | "";
  adult_ok?: boolean;
  limit?: number;
}

export interface RecommendationPreference extends QuizAnswers {
  id: string;
  updated_at: string;
}

export interface RecommendationItem {
  kind: RecommendationKind;
  id: string;
  name: string;
  price: number;
  is_free: boolean;
  currency: string;
  shelf: string;
  adult: boolean;
  image_url: string;
  tagline: string;
  href: string;
  score: number;
}

export interface QuizResponse {
  preference: RecommendationPreference;
  results: RecommendationItem[];
}

export interface SeededRecommendationResponse {
  seeds: { kind: RecommendationKind; id: string }[];
  results: RecommendationItem[];
}

export interface PairingsResponse {
  seed: { kind: RecommendationKind; id: string };
  results: RecommendationItem[];
}
