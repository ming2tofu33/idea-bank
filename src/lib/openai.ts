import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Model constants (vault_ib/02-Architecture/AI-Pipeline.md) */
export const MODELS = {
  /** Fast & cheap — idea generation */
  GENERATION: "o4-mini" as const,
  /** Structured analysis — deep report & evaluation */
  ANALYSIS: "gpt-4o" as const,
} as const;

/**
 * Shared OpenAI JSON response caller.
 * Reused by all AI endpoints: generate, report, evaluate.
 * Tracks token usage and latency for ai_runs logging.
 */
export async function callOpenAI(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}) {
  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: params.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: params.temperature ?? 0.8,
  });

  const latencyMs = Date.now() - startTime;
  const content = response.choices[0]?.message?.content ?? "";
  const usage = response.usage;

  return {
    content,
    inputTokens: usage?.prompt_tokens ?? 0,
    outputTokens: usage?.completion_tokens ?? 0,
    latencyMs,
  };
}
