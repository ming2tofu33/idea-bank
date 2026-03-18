import type { DeepReportResponse } from "@/types";

export function validateReportResponse(
  raw: string,
): { ok: true; data: DeepReportResponse } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const data = parsed as Record<string, unknown>;
  const required = [
    "elevator_pitch",
    "problem",
    "solution",
    "persona",
    "competition",
    "revenue_model",
    "mvp_scope",
    "risks",
    "resources",
  ];

  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }

  if (!Array.isArray(data.solution) || data.solution.length < 1) {
    return { ok: false, error: "solution must be a non-empty array" };
  }

  if (!Array.isArray(data.competition) || data.competition.length < 1) {
    return { ok: false, error: "competition must be a non-empty array" };
  }

  return { ok: true, data: data as unknown as DeepReportResponse };
}
