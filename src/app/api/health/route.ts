import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { callOpenAI, MODELS } from "@/lib/openai";

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

  // OpenAI test
  try {
    const response = await callOpenAI({
      model: MODELS.GENERATION,
      systemPrompt: "You are a test assistant. Respond in JSON.",
      userPrompt:
        'Respond with: {"status": "ok", "message": "OpenAI connected"}',
      temperature: 0,
    });
    const parsed = JSON.parse(response.content);
    results.openai = {
      status: "connected",
      model: MODELS.GENERATION,
      data: parsed,
      tokens: { input: response.inputTokens, output: response.outputTokens },
      latencyMs: response.latencyMs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    results.openai = { status: "error", message };
  }

  const allConnected =
    (results.firebase as Record<string, unknown>)?.status === "connected" &&
    (results.openai as Record<string, unknown>)?.status === "connected";

  return NextResponse.json(
    { healthy: allConnected, services: results },
    { status: allConnected ? 200 : 503 },
  );
}
