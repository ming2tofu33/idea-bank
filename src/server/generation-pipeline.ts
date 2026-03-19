import type { CategorizedKeywords } from "@/types";

export interface RawIdeaSeed {
  seed_id: string;
  target_user: string;
  painful_moment: string;
  unusual_wedge: string;
  why_now: string;
  idea_nucleus: string;
}

export interface SeedGenerationResponse {
  run_type: "idea_seed_generation";
  prompt_version: string;
  keywords_used: string[];
  seeds: RawIdeaSeed[];
}

export interface ScoredIdeaSeed {
  seed_id: string;
  title: string;
  summary: string;
  target_user: string;
  problem: string;
  solution_hint: string;
  clarity: number;
  surprise: number;
  urgency: number;
  feasibility: number;
  wedge: number;
  shortlisting_reason: string;
}

export interface CuratedIdeaCandidatesResponse {
  run_type: "idea_curation";
  prompt_version: string;
  keywords_used: string[];
  candidates: ScoredIdeaSeed[];
}

const CATEGORY_ORDER = [
  "who",
  "domain",
  "tech",
  "value",
  "money",
] as const satisfies ReadonlyArray<keyof CategorizedKeywords>;

export function flattenCategorizedKeywords(
  categorizedKeywords: CategorizedKeywords,
): string[] {
  const seen = new Set<string>();
  const flattened: string[] = [];

  for (const category of CATEGORY_ORDER) {
    for (const keyword of categorizedKeywords[category]) {
      const normalized = keyword.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      flattened.push(normalized);
    }
  }

  return flattened;
}

export function selectFinalCandidates(
  candidates: ScoredIdeaSeed[],
  limit: number,
): ScoredIdeaSeed[] {
  const ranked = [...candidates].sort(
    (left, right) => scoreCandidate(right) - scoreCandidate(left),
  );
  const strict = ranked.filter(
    (candidate) =>
      candidate.clarity >= 7 &&
      candidate.feasibility >= 6 &&
      candidate.urgency >= 6,
  );

  if (strict.length >= limit) {
    return strict.slice(0, limit);
  }

  const selected = [...strict];
  for (const candidate of ranked) {
    if (selected.some((item) => item.seed_id === candidate.seed_id)) continue;
    selected.push(candidate);
    if (selected.length === limit) break;
  }

  return selected;
}

function scoreCandidate(candidate: ScoredIdeaSeed): number {
  return (
    candidate.surprise * 0.35 +
    candidate.wedge * 0.25 +
    candidate.urgency * 0.2 +
    candidate.clarity * 0.1 +
    candidate.feasibility * 0.1
  );
}
