// ── Request types ──────────────────────────────

/** 카테고리별로 분류된 키워드 구조 — 모드별 프롬프트에 사용 */
export interface CategorizedKeywords {
  who: string[];
  domain: string[];
  tech: string[];
  value: string[];
  money: string[];
}

/** POST /api/generate */
export interface GenerateRequest {
  categorizedKeywords: CategorizedKeywords;
  mode: "full_match" | "forced_pairing" | "serendipity";
}

/** POST /api/report */
export interface ReportRequest {
  idea_id: string;
}

/** POST /api/evaluate */
export interface EvaluateRequest {
  idea_id: string;
}

// ── AI response types (Response-Contracts.md) ──

/** Single generated idea (before Firestore save) */
export interface IdeaGenerated {
  rank: number;
  title: string;
  summary: string;
  target_user: string;
  problem: string;
  solution_hint: string;
}

/** POST /api/generate response */
export interface GenerateResponse {
  run_type: "idea_generation";
  prompt_version: string;
  keywords_used: string[];
  ideas: IdeaGenerated[];
}

/** Deep Report persona */
export interface ReportPersona {
  name: string;
  context: string;
}

/** Deep Report competitor */
export interface ReportCompetitor {
  name: string;
  difference: string;
}

/** POST /api/report response (9-section PRD) */
export interface DeepReportResponse {
  run_type: "deep_report";
  prompt_version: string;
  idea_id: string;
  elevator_pitch: string;
  problem: string;
  solution: string[]; // exactly 3
  persona: ReportPersona;
  competition: ReportCompetitor[]; // 2-3
  revenue_model: string;
  mvp_scope: string[];
  risks: { technical: string; market: string };
  resources: { stack: string[]; timeline: string };
}

/** Evaluation rationale 3-layer structure */
export interface EvaluationRationaleResponse {
  reason: string;
  counterargument: string;
  verification_needed: string;
}

/** POST /api/evaluate response (4-dimension weighted eval) */
export interface EvaluateResponse {
  run_type: "evaluation";
  prompt_version: string;
  idea_id: string;
  scores: {
    market: number; // weight 0.30
    build: number; // weight 0.25
    edge: number; // weight 0.25
    money: number; // weight 0.20
  };
  rationales: {
    market: EvaluationRationaleResponse;
    build: EvaluationRationaleResponse;
    edge: EvaluationRationaleResponse;
    money: EvaluationRationaleResponse;
  };
  ethics: { flag: boolean; note: string };
  total_score: number;
  next_steps: string[];
}

// ── Unified error response (Backend-API.md section 3) ──

export type ErrorCode =
  | "GENERATION_FAILED"
  | "REPORT_FAILED"
  | "EVALUATION_FAILED"
  | "VALIDATION_FAILED"
  | "SAVE_FAILED"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "RATE_LIMIT"
  | "INTERNAL_ERROR"
  | "FIREBASE_CONNECTION_FAILED";

export interface ErrorResponse {
  error: true;
  code: ErrorCode;
  message: string;
  details?: string;
}

/** GET /api/stats */
export interface StatsResponse {
  stale_archived_count: number;
  monthly_cost_usd: number;
  monthly_api_calls: number;
  sessions_this_week: number;
}
