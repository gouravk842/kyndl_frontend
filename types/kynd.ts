export type RelationshipType =
  | "partner"
  | "mother"
  | "father"
  | "brother"
  | "sister"
  | "friend"
  | "child"
  | "colleague"
  | "other";

export type KyndCategory =
  | ""
  | "loves"
  | "wants"
  | "dislikes"
  | "food"
  | "details"
  | "places"
  | "said"
  | "other";

export interface KyndPerson {
  id: string;
  name: string;
  relationship_type: RelationshipType;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface KyndItem {
  id: string;
  person_id: string;
  category: KyndCategory;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KyndItemPage {
  items: KyndItem[];
  next_cursor: string | null;
}

export interface KyndItemInput {
  body?: string;
  title?: string;
  category?: KyndCategory;
  expected_updated_at?: string;
}

export interface KyndPersonInput {
  name?: string;
  relationship_type?: RelationshipType;
  expected_updated_at?: string;
}

export type KyndChatKind =
  | "user"
  | "answer"
  | "none"
  | "clarify"
  | "boundary"
  | "unavailable";

export interface KyndChatPersonRef {
  id: string;
  name: string;
  relationship_type: RelationshipType;
}

export interface KyndChatOffer {
  body: string;
  category: KyndCategory;
}

export interface KyndChatMessage {
  id: string;
  role: "user" | "kynd";
  body: string;
  kind: KyndChatKind;
  items: KyndItem[];
  offer_save: KyndChatOffer | null;
  clarification_people: KyndChatPersonRef[] | null;
  person_id: string | null;
  created_at: string;
}

export interface KyndChatTurn {
  user: KyndChatMessage;
  kynd: KyndChatMessage;
}

export interface KyndChatHistory {
  messages: KyndChatMessage[];
}
