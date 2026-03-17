import type { Timestamp } from "firebase-admin/firestore";

export type SessionType = "diverge" | "converge";

/** Firestore `sessions` collection document (Database-Schema.md section 4) */
export interface Session {
  id: string;
  session_date: Timestamp;
  session_type: SessionType;
  keywords_selected: string[];
  generation_mode: string;
  ideas_generated: number;
  ideas_bookmarked: string[];
  ideas_discarded: string[];
  session_duration: number; // seconds
}
