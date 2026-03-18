import { NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { checkStaleIdeas } from "@/server/stale-checker";
import { getAuthUser } from "@/server/auth-guard";
import type { StatsResponse } from "@/types";

// Per 1K tokens pricing
const PRICING: Record<string, { input: number; output: number }> = {
  "o4-mini": { input: 0.0011, output: 0.0044 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
};

export async function GET() {
  const user = await getAuthUser();
  if (user instanceof Response) return user;

  // 1. Run stale check (user-scoped)
  const staleCount = await checkStaleIdeas(user.userId);

  // 2. Monthly cost from ai_runs (global — cost is shared)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const aiRuns = await collections.aiRuns
    .where("created_at", ">=", monthStart)
    .get();

  let totalCost = 0;
  let callCount = 0;
  aiRuns.docs.forEach((doc) => {
    const data = doc.data();
    const pricing = PRICING[data.model] ?? PRICING["gpt-4o"];
    totalCost +=
      (data.input_tokens / 1000) * pricing.input +
      (data.output_tokens / 1000) * pricing.output;
    callCount++;
  });

  // 3. Sessions this week (user-scoped)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessions = await collections.sessions
    .where("user_id", "==", user.userId)
    .where("session_date", ">=", weekAgo)
    .get();

  const response: StatsResponse = {
    stale_archived_count: staleCount,
    monthly_cost_usd: Math.round(totalCost * 1000) / 1000,
    monthly_api_calls: callCount,
    sessions_this_week: sessions.size,
  };

  return NextResponse.json(response);
}
