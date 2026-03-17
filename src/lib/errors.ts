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
