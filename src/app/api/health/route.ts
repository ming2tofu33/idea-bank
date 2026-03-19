import { NextResponse } from "next/server";
import { db } from "@/server/firebase";

// GET /api/health — Firebase 연결 확인만 (OpenAI 실호출 없음 — 비용 공격 방어)
export async function GET() {
  const results: Record<string, unknown> = {};

  // Firebase test
  try {
    const testRef = db.collection("_health_check").doc("test");
    await testRef.set({ status: "ok", timestamp: new Date().toISOString() });
    const doc = await testRef.get();
    results.firebase = { status: "connected", data: doc.data() };
    await testRef.delete();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    results.firebase = { status: "error", message };
  }

  // OpenAI: 실호출 없이 키 설정 여부만 확인
  results.openai = {
    status: process.env.OPENAI_API_KEY ? "configured" : "missing",
  };

  const healthy =
    (results.firebase as Record<string, unknown>)?.status === "connected" &&
    (results.openai as Record<string, unknown>)?.status === "configured";

  return NextResponse.json(
    { healthy, services: results },
    { status: healthy ? 200 : 503 },
  );
}
