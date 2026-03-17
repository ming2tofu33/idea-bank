import type { Timestamp } from "firebase-admin/firestore";

export type AIRunType = "idea_generation" | "deep_report" | "evaluation";
export type ValidationStatus = "passed" | "failed" | "warning";
export type SaveStatus = "pending" | "saved" | "failed";

/** Firestore `ai_runs` collection document (Database-Schema.md section 6) */
export interface AIRun {
  id: string;
  run_type: AIRunType;
  prompt_version: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  validation_status: ValidationStatus;
  save_status: SaveStatus;
  retry_count: number;
  error_message: string | null;
  created_at: Timestamp;
}

export type AIRunCreateInput = Omit<AIRun, "id" | "created_at">;
