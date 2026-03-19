import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
import type { AIRunType } from "@/types";

/**
 * Firestore ai_runs 기반 유저별 Rate Limiter.
 * AI 호출 비용 보호 — 인증된 사용자도 무한 호출 방지.
 *
 * @param userId  유저 식별자 (email)
 * @param runType run_type 값 (ai_runs 컬렉션 필드)
 * @param limit   허용 횟수 (1시간 기준)
 * @returns 제한 초과 시 429 NextResponse, 통과 시 null
 */
export async function checkRateLimit(
  userId: string,
  runType: AIRunType,
  limit: number,
): Promise<Response | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const snapshot = await collections.aiRuns
    .where("user_id", "==", userId)
    .where("run_type", "==", runType)
    .where("created_at", ">=", oneHourAgo)
    .get();

  if (snapshot.size >= limit) {
    return errorResponse(
      "BAD_REQUEST",
      `Rate limit exceeded: max ${limit} ${runType} calls per hour`,
      429,
    );
  }

  return null;
}
