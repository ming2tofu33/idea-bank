import type { EvaluateResponse } from "@/types";

const DIMENSIONS = ["market", "build", "edge", "money"] as const;

export function validateEvaluationResponse(
  raw: string,
): { ok: true; data: EvaluateResponse } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const data = parsed as Record<string, unknown>;

  // Validate scores
  const scores = data.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores !== "object") {
    return { ok: false, error: "Missing scores object" };
  }
  for (const dim of DIMENSIONS) {
    if (
      typeof scores[dim] !== "number" ||
      (scores[dim] as number) < 0 ||
      (scores[dim] as number) > 100
    ) {
      return { ok: false, error: `scores.${dim} must be number 0-100` };
    }
  }

  // Validate rationales (3-layer structure)
  const rationales = data.rationales as Record<string, unknown> | undefined;
  if (!rationales || typeof rationales !== "object") {
    return { ok: false, error: "Missing rationales object" };
  }
  for (const dim of DIMENSIONS) {
    const r = rationales[dim] as Record<string, unknown> | undefined;
    if (!r?.reason || !r?.counterargument || !r?.verification_needed) {
      return {
        ok: false,
        error: `rationales.${dim} must have reason, counterargument, verification_needed`,
      };
    }
  }

  // Validate total_score
  if (typeof data.total_score !== "number") {
    return { ok: false, error: "Missing total_score" };
  }

  return { ok: true, data: data as unknown as EvaluateResponse };
}
