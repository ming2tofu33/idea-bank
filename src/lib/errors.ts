import { NextResponse } from "next/server";
import type { ErrorCode, ErrorResponse } from "@/types";

/** Create a unified error NextResponse */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: string,
) {
  const body: ErrorResponse = {
    error: true,
    code,
    message,
    ...(details && { details }),
  };
  return NextResponse.json(body, { status });
}

/**
 * 서버 내부 에러용 — 실제 에러는 서버 로그에만 기록하고
 * 클라이언트에는 generic 메시지만 반환한다 (보안).
 */
export function serverErrorResponse(
  code: ErrorCode,
  error: unknown,
  clientMessage: string,
  status = 500,
) {
  console.error(`[API:${code}]`, error);
  return errorResponse(code, clientMessage, status);
}

/** Firestore write with retry (max 3 attempts, exponential backoff) */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Unreachable");
}
