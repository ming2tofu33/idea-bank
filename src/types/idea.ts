import type { Timestamp } from "firebase-admin/firestore";

export type GenerationMode = "full_match" | "forced_pairing" | "serendipity";

export type IdeaStatus =
  | "new"
  | "interested"
  | "reviewing"
  | "executing"
  | "on_hold"
  | "archived";

/** Firestore `ideas` collection document (Database-Schema.md section 2) */
export interface Idea {
  id: string;
  title: string;
  summary: string;
  keywords_used: string[];
  generation_mode: GenerationMode;
  status: IdeaStatus;
  bookmarked: boolean;
  created_at: Timestamp;
  last_reviewed: Timestamp;
  stale_flag: boolean;
  duplicate_warning: boolean;
  deep_report_id: string | null;
  evaluation_id: string | null;
  total_score: number | null;
  target_user: string;
  problem: string;
  solution_hint: string;
}

/** Input for creation (server auto-sets ID, timestamps, flags) */
export type IdeaCreateInput = Omit<
  Idea,
  | "id"
  | "created_at"
  | "last_reviewed"
  | "stale_flag"
  | "duplicate_warning"
  | "deep_report_id"
  | "evaluation_id"
  | "total_score"
>;

/** PATCH /api/ideas/[id] updatable fields */
export type IdeaPatchInput = Partial<
  Pick<
    Idea,
    "status" | "bookmarked" | "deep_report_id" | "evaluation_id" | "total_score"
  >
>;
