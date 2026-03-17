import type { Timestamp } from "firebase-admin/firestore";

/** 3-layer rationale: reason + counterargument + verification_needed */
export interface EvaluationRationale {
  reason: string;
  counterargument: string;
  verification_needed: string;
}

/** Firestore `evaluations` collection document (Database-Schema.md section 3) */
export interface Evaluation {
  id: string;
  idea_id: string;
  market_score: number;
  market_rationale: EvaluationRationale;
  build_score: number;
  build_rationale: EvaluationRationale;
  edge_score: number;
  edge_rationale: EvaluationRationale;
  money_score: number;
  money_rationale: EvaluationRationale;
  ethics_flag: boolean;
  ethics_note: string;
  total_score: number;
  next_steps: string[];
  evaluated_at: Timestamp;
}

export type EvaluationDimension = "market" | "build" | "edge" | "money";
