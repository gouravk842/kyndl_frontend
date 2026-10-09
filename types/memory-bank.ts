export interface MemoryPhotoVariant {
  url: string;
  content_type?: string;
  width?: number | null;
  height?: number | null;
}

export interface MemoryPhoto {
  id: string;
  file_id: string;
  url: string | null;
  content_type: string;
  variants: Record<string, MemoryPhotoVariant>;
}

export interface BankConversionLink {
  id: string;
  feature: string;
  label: string;
  creation_id: string;
  mode: "live" | "snapshot";
  title: string;
  source_circle_id?: string | null;
  source_bank_name?: string;
}

export interface ConvertQuestion {
  id: string;
  label: string;
  help: string;
  kind: "choice" | "text";
  default: string;
  options?: { value: string; label: string }[];
}

export interface ConvertFeature {
  id: string;
  label: string;
  icon: string;
  description: string;
  supports: { live: boolean; snapshot: boolean; move: boolean };
  questions: ConvertQuestion[];
  assess: { total: number; hint: string; warnings: string[] };
}

export interface ConvertRequest {
  feature: string;
  mode?: "live" | "snapshot";
  disposition?: "keep" | "move";
  name?: string;
  follow_bank_name?: boolean;
  memory_id?: string;
  idempotency_key?: string;
  on_existing?: "open" | "update" | "create";
  conversion_id?: string;
  answers?: Record<string, unknown>;
}

export interface ConvertPreview {
  feature: string;
  name: string;
  mapped_count: number;
  skipped: { memory_id: string; title: string; reason: string }[];
  fallbacks: { memory_id: string; title: string; reason: string }[];
  samples: { title: string; detail: string }[];
  sample_offset: number;
  sample_total: number;
}

export interface ConvertResult {
  id: string;
  feature: string;
  label: string;
  creation_id: string;
  mode: "live" | "snapshot";
  title: string;
  replayed?: boolean;
  source_circle_id?: string | null;
  source_bank_name?: string;
}

export interface MemoryPreview {
  id: string;
  title: string;
  excerpt: string;
  occurred_on: string | null;
  photo_count: number;
}

export type MemoryWarmth = "out" | "ember" | "lit";

export interface MemoryCircle {
  id: string;
  name: string;
  is_loose: boolean;
  memory_count: number;
  /** Days this bank has been tended. The loose pile stays at 0. */
  streak?: number;
  warmth?: MemoryWarmth;
  latest_memory: MemoryPreview | null;
  cover: { url: string | null; file_id: string; chosen?: boolean } | null;
  /** Keepsakes made from this bank. Empty when it has not been converted. */
  conversions?: BankConversionLink[];
  created_at: string;
  updated_at: string;
}

export interface MemoryLocation {
  name: string;
  label: string;
  lat: number | null;
  lng: number | null;
}

export interface BankMemory {
  id: string;
  circle_id: string;
  title: string;
  note: string;
  occurred_on: string | null;
  location: MemoryLocation | null;
  photos: MemoryPhoto[];
  created_at: string;
  updated_at: string;
}

export interface MemoryInput {
  title?: string;
  note?: string;
  occurred_on?: string | null;
  location?: MemoryLocation | null;
  photos?: string[];
}

export interface MemorySearchGroup {
  circle: { id: string; name: string };
  memories: MemoryPreview[];
}

export interface MemorySearchResult {
  groups: MemorySearchGroup[];
  limited: boolean;
}

export interface TrashedCircle {
  id: string;
  name: string;
  memory_count: number;
  deleted_at: string;
  purges_on: string;
}

export interface TrashedMemory extends MemoryPreview {
  circle: { id: string; name: string };
  deleted_at: string;
  purges_on: string;
}

export interface MemoryTrash {
  retention_days: number;
  circles: TrashedCircle[];
  memories: TrashedMemory[];
}

export interface StreakBank {
  circle_id: string;
  name: string;
  streak: number;
  warmth: MemoryWarmth;
}

export interface MemoryStreak {
  current_streak: number;
  longest_streak: number;
  last_kept_on: string | null;
  ember_on: string | null;
  state: MemoryWarmth;
  kept_today: boolean;
  milestone: string | null;
  public: boolean;
  public_name: string;
  suggested_name: string;
  timezone: string;
  banks: StreakBank[];
}

export interface LeaderboardEntry {
  rank: number;
  public_name: string;
  value: number;
  is_you: boolean;
}

export interface StreakLeaderboard {
  board: "current" | "longest" | "week";
  entries: LeaderboardEntry[];
  you: LeaderboardEntry | null;
}

export interface MemoryExport {
  exported_at: string;
  circles: {
    name: string;
    is_loose: boolean;
    created_at: string;
    memories: {
      title: string;
      note: string;
      occurred_on: string | null;
      location: MemoryLocation | null;
      created_at: string;
      photos: MemoryPhoto[];
    }[];
  }[];
}
