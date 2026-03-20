import type {
  Idea,
  IdeaPatchInput,
  Keyword,
  KeywordCreateInput,
  GenerateRequest,
  GenerateResponse,
  DeepReportResponse,
  StatsResponse,
  EvaluateResponse,
} from "@/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Ideas ──

export function fetchIdeas(params?: {
  status?: string;
  bookmarked?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ ideas: Idea[]; count: number; next_cursor: string | null }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.bookmarked) query.set("bookmarked", params.bookmarked);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  const qs = query.toString();
  return request(`/api/ideas${qs ? `?${qs}` : ""}`);
}

export function fetchIdea(id: string): Promise<Idea> {
  return request(`/api/ideas/${id}`);
}

export function patchIdea(id: string, data: IdeaPatchInput): Promise<Idea> {
  return request(`/api/ideas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Keywords ──

export function fetchKeywords(
  category?: string,
): Promise<{ keywords: Keyword[] }> {
  const qs = category ? `?category=${category}` : "";
  return request(`/api/keywords${qs}`);
}

export function createKeyword(data: KeywordCreateInput): Promise<Keyword> {
  return request("/api/keywords", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteKeyword(id: string): Promise<void> {
  return request(`/api/keywords/${id}`, { method: "DELETE" });
}

// ── AI ──

export function generateIdeas(
  data: GenerateRequest,
): Promise<GenerateResponse & { saved_ids: string[] }> {
  return request("/api/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function generateReport(
  ideaId: string,
): Promise<DeepReportResponse & { report_id: string }> {
  return request("/api/report", {
    method: "POST",
    body: JSON.stringify({ idea_id: ideaId }),
  });
}

export function evaluateIdea(
  ideaId: string,
): Promise<EvaluateResponse & { evaluation_id: string }> {
  return request("/api/evaluate", {
    method: "POST",
    body: JSON.stringify({ idea_id: ideaId }),
  });
}

// ── Stats ──

export function fetchStats(): Promise<StatsResponse> {
  return request("/api/stats");
}
