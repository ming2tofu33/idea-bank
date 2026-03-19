import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { callOpenAI, MODELS } from "@/server/openai";
import { errorResponse, withRetry } from "@/lib/errors";
import {
  buildCuratedIdeasPrompt,
  buildSeedGenerationPrompt,
} from "@/server/prompts/generation";
import { validateGenerateResponse } from "@/server/validators/idea-response";
import { getAuthUser } from "@/server/auth-guard";
import { checkRateLimit } from "@/server/rate-limiter";
import { FieldValue } from "firebase-admin/firestore";
import {
  flattenCategorizedKeywords,
  selectFinalCandidates,
} from "@/server/generation-pipeline";
import {
  validateCuratedIdeaCandidatesResponse,
  validateSeedGenerationResponse,
} from "@/server/validators/generation-candidates";
import type {
  AIRunCreateInput,
  CategorizedKeywords,
  GenerateRequest,
  GenerateResponse,
  IdeaGenerated,
} from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const user = await getAuthUser();
    if (user instanceof Response) return user;

    // Rate limit: 시간당 10회
    const rateLimited = await checkRateLimit(user.userId, "idea_generation", 10);
    if (rateLimited) return rateLimited;

    const body: GenerateRequest = await request.json();

    if (!body.categorizedKeywords || !body.mode) {
      return errorResponse(
        "BAD_REQUEST",
        "categorizedKeywords and mode are required",
        400,
      );
    }

    const ck: CategorizedKeywords = body.categorizedKeywords;
    const allKeywords = flattenCategorizedKeywords(ck);

    if (allKeywords.length === 0) {
      return errorResponse("BAD_REQUEST", "At least one keyword is required", 400);
    }
    if (allKeywords.length > 20) {
      return errorResponse("BAD_REQUEST", "Too many keywords (max 20)", 400);
    }
    if (allKeywords.some((k) => k.length > 100)) {
      return errorResponse("BAD_REQUEST", "Keyword too long (max 100 chars)", 400);
    }

    // 1. Fetch recent 30-day titles for duplicate prevention
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIdeas = await collections.ideas
      .where("user_id", "==", user.userId)
      .where("created_at", ">=", thirtyDaysAgo)
      .get();
    const existingTitles = recentIdeas.docs.map(
      (d) => d.data().title as string,
    );

    // 2. Stage 1 — generate raw seeds
    const {
      systemPrompt: seedSystemPrompt,
      userPrompt: seedUserPrompt,
    } = buildSeedGenerationPrompt(
      ck,
      body.mode,
      existingTitles,
    );

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalLatencyMs = 0;
    let retryCount = 0;

    let seedResult = await callOpenAI({
      model: MODELS.GENERATION,
      systemPrompt: seedSystemPrompt,
      userPrompt: seedUserPrompt,
    });
    totalInputTokens += seedResult.inputTokens;
    totalOutputTokens += seedResult.outputTokens;
    totalLatencyMs += seedResult.latencyMs;

    let seedValidation = validateSeedGenerationResponse(seedResult.content);

    if (!seedValidation.ok) {
      retryCount = 1;
      seedResult = await callOpenAI({
        model: MODELS.GENERATION,
        systemPrompt: seedSystemPrompt,
        userPrompt: seedUserPrompt,
      });
      totalInputTokens += seedResult.inputTokens;
      totalOutputTokens += seedResult.outputTokens;
      totalLatencyMs += seedResult.latencyMs;
      seedValidation = validateSeedGenerationResponse(seedResult.content);
    }

    if (!seedValidation.ok) {
      const failedRun: AIRunCreateInput = {
        user_id: user.userId,
        run_type: "idea_generation",
        prompt_version: "idea.v3",
        model: MODELS.GENERATION,
        input_tokens: totalInputTokens,
        output_tokens: totalOutputTokens,
        latency_ms: totalLatencyMs,
        validation_status: "failed",
        save_status: "failed",
        retry_count: retryCount,
        error_message: seedValidation.error,
      };

      await collections.aiRuns.add({
        ...failedRun,
        created_at: FieldValue.serverTimestamp(),
      });
      return errorResponse("VALIDATION_FAILED", seedValidation.error, 422);
    }

    // 3. Stage 2 — curate and rewrite the strongest candidates
    const {
      systemPrompt: curateSystemPrompt,
      userPrompt: curateUserPrompt,
    } = buildCuratedIdeasPrompt(
      seedValidation.data.seeds,
      allKeywords,
      body.mode,
    );

    let curatedResult = await callOpenAI({
      model: MODELS.GENERATION,
      systemPrompt: curateSystemPrompt,
      userPrompt: curateUserPrompt,
    });
    totalInputTokens += curatedResult.inputTokens;
    totalOutputTokens += curatedResult.outputTokens;
    totalLatencyMs += curatedResult.latencyMs;

    let curatedValidation = validateCuratedIdeaCandidatesResponse(
      curatedResult.content,
    );

    if (!curatedValidation.ok) {
      retryCount += 1;
      curatedResult = await callOpenAI({
        model: MODELS.GENERATION,
        systemPrompt: curateSystemPrompt,
        userPrompt: curateUserPrompt,
      });
      totalInputTokens += curatedResult.inputTokens;
      totalOutputTokens += curatedResult.outputTokens;
      totalLatencyMs += curatedResult.latencyMs;
      curatedValidation = validateCuratedIdeaCandidatesResponse(
        curatedResult.content,
      );
    }

    const aiRunData: AIRunCreateInput = {
      user_id: user.userId,
      run_type: "idea_generation",
      prompt_version: "idea.v3",
      model: MODELS.GENERATION,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      latency_ms: totalLatencyMs,
      validation_status: curatedValidation.ok ? "passed" : "failed",
      save_status: "pending",
      retry_count: retryCount,
      error_message: curatedValidation.ok ? null : curatedValidation.error,
    };

    if (!curatedValidation.ok) {
      aiRunData.save_status = "failed";
      await collections.aiRuns.add({
        ...aiRunData,
        created_at: FieldValue.serverTimestamp(),
      });
      return errorResponse("VALIDATION_FAILED", curatedValidation.error, 422);
    }

    const finalists = selectFinalCandidates(curatedValidation.data.candidates, 10);
    const ideas: IdeaGenerated[] = finalists.map((candidate, index) => ({
      rank: index + 1,
      title: candidate.title,
      summary: candidate.summary,
      target_user: candidate.target_user,
      problem: candidate.problem,
      solution_hint: candidate.solution_hint,
    }));

    const finalResponse: GenerateResponse = {
      run_type: "idea_generation",
      prompt_version: "idea.v3",
      keywords_used: allKeywords,
      ideas,
    };

    const finalValidation = validateGenerateResponse(JSON.stringify(finalResponse));
    if (!finalValidation.ok) {
      aiRunData.validation_status = "failed";
      aiRunData.save_status = "failed";
      aiRunData.error_message = finalValidation.error;
      await collections.aiRuns.add({
        ...aiRunData,
        created_at: FieldValue.serverTimestamp(),
      });
      return errorResponse("VALIDATION_FAILED", finalValidation.error, 422);
    }

    // 4. Save 10 ideas to Firestore
    const savedIds: string[] = [];
    for (const idea of finalResponse.ideas) {
      const docRef = await withRetry(() =>
        collections.ideas.add({
          user_id: user.userId,
          title: idea.title,
          summary: idea.summary,
          keywords_used: allKeywords,
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

    // 5. Update ai_run log
    aiRunData.save_status = "saved";
    await collections.aiRuns.add({
      ...aiRunData,
      created_at: FieldValue.serverTimestamp(),
    });

    // 6. Save session log
    const sessionRef = await collections.sessions.add({
      user_id: user.userId,
      session_date: FieldValue.serverTimestamp(),
      session_type: "diverge",
      keywords_selected: allKeywords,
      generation_mode: body.mode,
      ideas_generated: savedIds.length,
      ideas_bookmarked: [],
      ideas_discarded: [],
      session_duration: Math.round((Date.now() - startTime) / 1000),
    });

    return NextResponse.json({
      ...finalResponse,
      saved_ids: savedIds,
      session_id: sessionRef.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("GENERATION_FAILED", message, 500);
  }
}
