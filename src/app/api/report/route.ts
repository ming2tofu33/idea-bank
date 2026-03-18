import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { callOpenAI, MODELS } from "@/server/openai";
import { errorResponse, withRetry } from "@/lib/errors";
import { buildReportPrompt } from "@/server/prompts/report";
import { validateReportResponse } from "@/server/validators/report-response";
import { FieldValue } from "firebase-admin/firestore";
import type { ReportRequest, AIRunCreateInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    if (!body.idea_id) {
      return errorResponse("BAD_REQUEST", "idea_id is required", 400);
    }

    // 1. Fetch idea
    const ideaDoc = await collections.ideas.doc(body.idea_id).get();
    if (!ideaDoc.exists) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }
    const idea = ideaDoc.data()!;

    // 2. Build prompt & call GPT-4o
    const { systemPrompt, userPrompt } = buildReportPrompt({
      id: ideaDoc.id,
      title: idea.title as string,
      summary: idea.summary as string,
      keywords_used: idea.keywords_used as string[],
      target_user: idea.target_user as string,
      problem: idea.problem as string,
      solution_hint: idea.solution_hint as string,
    });

    let aiResult = await callOpenAI({
      model: MODELS.ANALYSIS,
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    let validation = validateReportResponse(aiResult.content);
    let retryCount = 0;

    if (!validation.ok) {
      retryCount = 1;
      aiResult = await callOpenAI({
        model: MODELS.ANALYSIS,
        systemPrompt,
        userPrompt,
        temperature: 0.7,
      });
      validation = validateReportResponse(aiResult.content);
    }

    // 3. Log ai_run
    const aiRunData: AIRunCreateInput = {
      run_type: "deep_report",
      prompt_version: "prd.v1",
      model: MODELS.ANALYSIS,
      input_tokens: aiResult.inputTokens,
      output_tokens: aiResult.outputTokens,
      latency_ms: aiResult.latencyMs,
      validation_status: validation.ok ? "passed" : "failed",
      save_status: "pending",
      retry_count: retryCount,
      error_message: validation.ok ? null : validation.error,
    };

    if (!validation.ok) {
      aiRunData.save_status = "failed";
      await collections.aiRuns.add({
        ...aiRunData,
        created_at: FieldValue.serverTimestamp(),
      });
      return errorResponse("VALIDATION_FAILED", validation.error, 422);
    }

    // 4. Save report to deep_reports collection
    const reportRef = await withRetry(() =>
      collections.deepReports.add({
        ...validation.data,
        idea_id: body.idea_id,
        created_at: FieldValue.serverTimestamp(),
      }),
    );

    // 5. Update idea: link report + transition to reviewing
    await collections.ideas.doc(body.idea_id).update({
      deep_report_id: reportRef.id,
      status: "reviewing",
      last_reviewed: FieldValue.serverTimestamp(),
    });

    aiRunData.save_status = "saved";
    await collections.aiRuns.add({
      ...aiRunData,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ report_id: reportRef.id, ...validation.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("REPORT_FAILED", message, 500);
  }
}
