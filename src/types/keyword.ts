import type { Timestamp } from "firebase-admin/firestore";

export type KeywordCategory = "who" | "domain" | "tech" | "value" | "money";
export type KeywordSource = "fixed" | "custom" | "dynamic";

/** Firestore `keywords` collection document (Database-Schema.md section 5) */
export interface Keyword {
  id: string;
  keyword: string;
  category: KeywordCategory;
  source: KeywordSource;
  added_at: Timestamp;
  used_count: number;
  last_used: Timestamp | null;
}

export interface KeywordCreateInput {
  keyword: string;
  category: KeywordCategory;
}
