import type { GenerateResponse } from "@/types";

export function validateGenerateResponse(
  raw: string,
): { ok: true; data: GenerateResponse } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }

  const data = parsed as Record<string, unknown>;

  if (data.run_type !== "idea_generation") {
    return {
      ok: false,
      error: `run_type must be "idea_generation", got "${data.run_type}"`,
    };
  }

  if (!Array.isArray(data.ideas) || data.ideas.length !== 10) {
    return {
      ok: false,
      error: `ideas must be array of exactly 10, got ${Array.isArray(data.ideas) ? data.ideas.length : typeof data.ideas}`,
    };
  }

  const titles: string[] = [];
  for (let i = 0; i < data.ideas.length; i++) {
    const idea = data.ideas[i] as Record<string, unknown>;
    if (!idea.title || !idea.summary) {
      return { ok: false, error: `ideas[${i}] missing title or summary` };
    }
    titles.push((idea.title as string).trim().toLowerCase());
  }

  // 중복 제목 체크
  if (new Set(titles).size !== titles.length) {
    return { ok: false, error: "Duplicate titles detected in generated ideas" };
  }

  return { ok: true, data: data as unknown as GenerateResponse };
}
