import type {
  CuratedIdeaCandidatesResponse,
  RawIdeaSeed,
  ScoredIdeaSeed,
  SeedGenerationResponse,
} from "@/server/generation-pipeline";

export function validateSeedGenerationResponse(
  raw: string,
):
  | { ok: true; data: SeedGenerationResponse }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const data = parsed as Record<string, unknown>;
  if (data.run_type !== "idea_seed_generation") {
    return {
      ok: false,
      error: `run_type must be "idea_seed_generation", got "${data.run_type}"`,
    };
  }

  if (!Array.isArray(data.seeds) || data.seeds.length !== 24) {
    return {
      ok: false,
      error: `seeds must be array of exactly 24, got ${Array.isArray(data.seeds) ? data.seeds.length : typeof data.seeds}`,
    };
  }

  for (let i = 0; i < data.seeds.length; i++) {
    const seed = data.seeds[i] as Partial<RawIdeaSeed>;
    const requiredFields: (keyof RawIdeaSeed)[] = [
      "seed_id",
      "target_user",
      "painful_moment",
      "unusual_wedge",
      "why_now",
      "idea_nucleus",
    ];

    for (const field of requiredFields) {
      if (!seed[field] || typeof seed[field] !== "string") {
        return { ok: false, error: `seeds[${i}] missing ${field}` };
      }
    }
  }

  return { ok: true, data: data as unknown as SeedGenerationResponse };
}

export function validateCuratedIdeaCandidatesResponse(
  raw: string,
):
  | { ok: true; data: CuratedIdeaCandidatesResponse }
  | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const data = parsed as Record<string, unknown>;
  if (data.run_type !== "idea_curation") {
    return {
      ok: false,
      error: `run_type must be "idea_curation", got "${data.run_type}"`,
    };
  }

  if (!Array.isArray(data.candidates) || data.candidates.length < 10) {
    return {
      ok: false,
      error: `candidates must be array of at least 10, got ${Array.isArray(data.candidates) ? data.candidates.length : typeof data.candidates}`,
    };
  }

  for (let i = 0; i < data.candidates.length; i++) {
    const candidate = data.candidates[i] as Partial<ScoredIdeaSeed>;
    const requiredStringFields: (keyof ScoredIdeaSeed)[] = [
      "seed_id",
      "title",
      "summary",
      "target_user",
      "problem",
      "solution_hint",
      "shortlisting_reason",
    ];
    const requiredNumberFields: (keyof ScoredIdeaSeed)[] = [
      "clarity",
      "surprise",
      "urgency",
      "feasibility",
      "wedge",
    ];

    for (const field of requiredStringFields) {
      if (!candidate[field] || typeof candidate[field] !== "string") {
        return { ok: false, error: `candidates[${i}] missing ${field}` };
      }
    }

    for (const field of requiredNumberFields) {
      if (
        typeof candidate[field] !== "number" ||
        Number.isNaN(candidate[field]) ||
        candidate[field] < 1 ||
        candidate[field] > 10
      ) {
        return {
          ok: false,
          error: `candidates[${i}] invalid ${field}`,
        };
      }
    }
  }

  return { ok: true, data: data as unknown as CuratedIdeaCandidatesResponse };
}
