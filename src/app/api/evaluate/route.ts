import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { callOpenAI, MODELS } from "@/server/openai";
import { errorResponse, serverErrorResponse, withRetry } from "@/lib/errors";
import { buildEvaluationPrompt } from "@/server/prompts/evaluation";
import { validateEvaluationResponse } from "@/server/validators/evaluation-response";
import { getAuthUser } from "@/server/auth-guard";
import { checkRateLimit } from "@/server/rate-limiter";
import { FieldValue } from "firebase-admin/firestore";
import type { EvaluateRequest, AIRunCreateInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    // Rate limit: 시간당 5회
    const rateLimited = await checkRateLimit(user.userId, "evaluation", 5);
    if (rateLimited) return rateLimited;

    const body: EvaluateRequest = await request.json();
    if (!body.idea_id) {
      return errorResponse("BAD_REQUEST", "idea_id is required", 400);
    }

    // 1. Fetch idea
    const ideaDoc = await collections.ideas.doc(body.idea_id).get();
    if (!ideaDoc.exists) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }
    const idea = ideaDoc.data()!;

    // 소유권 체크 — 다른 유저 아이디어로 AI 호출 방지 (IDOR)
    if (idea.user_id !== user.userId) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }

    // 2. Fetch deep report (required before evaluation)
    if (!idea.deep_report_id) {
      return errorResponse(
        "BAD_REQUEST",
        "Idea has no deep report. Generate report first.",
        400,
      );
    }
    const reportDoc = await collections.deepReports
      .doc(idea.deep_report_id as string)
      .get();
    if (!reportDoc.exists) {
      return errorResponse("NOT_FOUND", "Deep report not found", 404);
    }
    const report = reportDoc.data()!;

    // 3. Build prompt & call GPT-4o (with few-shot examples)
    const { systemPrompt, userPrompt } = buildEvaluationPrompt(
      body.idea_id,
      {
        elevator_pitch: report.elevator_pitch as string,
        problem: report.problem as string,
        solution: report.solution as string[],
        persona: report.persona as { name: string; context: string },
        competition: report.competition as {
          name: string;
          difference: string;
        }[],
        revenue_model: report.revenue_model as string,
        mvp_scope: report.mvp_scope as string[],
        risks: report.risks as { technical: string; market: string },
      },
    );

    let aiResult = await callOpenAI({
      model: MODELS.ANALYSIS,
      systemPrompt,
      userPrompt,
      temperature: 0.5,
    });

    let validation = validateEvaluationResponse(aiResult.content);
    let retryCount = 0;

    if (!validation.ok) {
      retryCount = 1;
      aiResult = await callOpenAI({
        model: MODELS.ANALYSIS,
        systemPrompt,
        userPrompt,
        temperature: 0.5,
      });
      validation = validateEvaluationResponse(aiResult.content);
    }

    // 4. Log ai_run
    const aiRunData: AIRunCreateInput = {
      user_id: user.userId,
      run_type: "evaluation",
      prompt_version: "eval.v1",
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

    // 5. Save evaluation to evaluations collection
    const evalData = validation.data;
    const evalRef = await withRetry(() =>
      collections.evaluations.add({
        idea_id: body.idea_id,
        market_score: evalData.scores.market,
        market_rationale: evalData.rationales.market,
        build_score: evalData.scores.build,
        build_rationale: evalData.rationales.build,
        edge_score: evalData.scores.edge,
        edge_rationale: evalData.rationales.edge,
        money_score: evalData.scores.money,
        money_rationale: evalData.rationales.money,
        ethics_flag: evalData.ethics.flag,
        ethics_note: evalData.ethics.note,
        total_score: evalData.total_score,
        next_steps: evalData.next_steps,
        evaluated_at: FieldValue.serverTimestamp(),
      }),
    );

    // 6. Update idea: link evaluation + score-based status transition
    const newStatus =
      evalData.total_score < 60 ? "on_hold" : "reviewing";

    await collections.ideas.doc(body.idea_id).update({
      evaluation_id: evalRef.id,
      total_score: evalData.total_score,
      status: newStatus,
      last_reviewed: FieldValue.serverTimestamp(),
    });

    aiRunData.save_status = "saved";
    await collections.aiRuns.add({
      ...aiRunData,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      evaluation_id: evalRef.id,
      ...evalData,
    });
  } catch (error) {
    return serverErrorResponse("EVALUATION_FAILED", error, "평가 중 오류가 발생했습니다");
  }
}
