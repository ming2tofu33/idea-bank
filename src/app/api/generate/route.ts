import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { callOpenAI, MODELS } from "@/server/openai";
import { errorResponse, withRetry } from "@/lib/errors";
import { buildGenerationPrompt } from "@/server/prompts/generation";
import { validateGenerateResponse } from "@/server/validators/idea-response";
import { FieldValue } from "firebase-admin/firestore";
import type { GenerateRequest, AIRunCreateInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.keywords?.length || !body.mode) {
      return errorResponse(
        "BAD_REQUEST",
        "keywords and mode are required",
        400,
      );
    }

    // 1. Fetch recent 30-day titles for duplicate prevention
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIdeas = await collections.ideas
      .where("created_at", ">=", thirtyDaysAgo)
      .get();
    const existingTitles = recentIdeas.docs.map(
      (d) => d.data().title as string,
    );

    // 2. Build prompt
    const { systemPrompt, userPrompt } = buildGenerationPrompt(
      body.keywords,
      body.mode,
      existingTitles,
    );

    // 3. Call OpenAI (with 1 retry on validation failure)
    let aiResult = await callOpenAI({
      model: MODELS.GENERATION,
      systemPrompt,
      userPrompt,
    });

    let validation = validateGenerateResponse(aiResult.content);
    let retryCount = 0;

    if (!validation.ok) {
      retryCount = 1;
      aiResult = await callOpenAI({
        model: MODELS.GENERATION,
        systemPrompt,
        userPrompt,
      });
      validation = validateGenerateResponse(aiResult.content);
    }

    // 4. Log to ai_runs
    const aiRunData: AIRunCreateInput = {
      run_type: "idea_generation",
      prompt_version: "idea.v1",
      model: MODELS.GENERATION,
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

    // 5. Save 10 ideas to Firestore
    const savedIds: string[] = [];
    for (const idea of validation.data.ideas) {
      const docRef = await withRetry(() =>
        collections.ideas.add({
          title: idea.title,
          summary: idea.summary,
          keywords_used: body.keywords,
          generation_mode: body.mode,
          status: "new",
          bookmarked: false,
          created_at: FieldValue.serverTimestamp(),
          last_reviewed: FieldValue.serverTimestamp(),
          stale_flag: false,
          duplicate_warning: existingTitles.includes(idea.title),
          deep_report_id: null,
          evaluation_id: null,
          total_score: null,
          target_user: idea.target_user,
          problem: idea.problem,
          solution_hint: idea.solution_hint,
        }),
      );
      savedIds.push(docRef.id);
    }

    // 6. Update ai_run log
    aiRunData.save_status = "saved";
    await collections.aiRuns.add({
      ...aiRunData,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      ...validation.data,
      saved_ids: savedIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("GENERATION_FAILED", message, 500);
  }
}
