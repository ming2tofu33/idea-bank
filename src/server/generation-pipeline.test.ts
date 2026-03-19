import test from "node:test";
import assert from "node:assert/strict";

import {
  flattenCategorizedKeywords,
  selectFinalCandidates,
  type RawIdeaSeed,
  type ScoredIdeaSeed,
} from "./generation-pipeline";
import {
  buildCuratedIdeasPrompt,
  buildSeedGenerationPrompt,
} from "./prompts/generation";
import {
  validateCuratedIdeaCandidatesResponse,
  validateSeedGenerationResponse,
} from "./validators/generation-candidates";

test("flattenCategorizedKeywords flattens categories in stable order and removes duplicates", () => {
  const flattened = flattenCategorizedKeywords({
    who: ["Z세대", "1인 가구"],
    domain: ["핀테크"],
    tech: ["LLM 에이전트", "핀테크"],
    value: ["시간 단축"],
    money: ["구독형(SaaS)"],
  });

  assert.deepEqual(flattened, [
    "Z세대",
    "1인 가구",
    "핀테크",
    "LLM 에이전트",
    "시간 단축",
    "구독형(SaaS)",
  ]);
});

test("selectFinalCandidates rejects obscure ideas that fail clarity or feasibility guardrails", () => {
  const candidates: ScoredIdeaSeed[] = [
    makeCandidate("clear-winner", {
      clarity: 9,
      surprise: 8,
      urgency: 8,
      feasibility: 8,
      wedge: 8,
    }),
    makeCandidate("too-weird", {
      clarity: 5,
      surprise: 10,
      urgency: 8,
      feasibility: 7,
      wedge: 9,
    }),
    makeCandidate("too-magical", {
      clarity: 9,
      surprise: 9,
      urgency: 7,
      feasibility: 4,
      wedge: 8,
    }),
  ];

  const selected = selectFinalCandidates(candidates, 1);

  assert.equal(selected.length, 1);
  assert.equal(selected[0]?.seed_id, "clear-winner");
});

test("selectFinalCandidates ranks the bold but understandable candidate first", () => {
  const candidates: ScoredIdeaSeed[] = [
    makeCandidate("solid", {
      clarity: 8,
      surprise: 6,
      urgency: 8,
      feasibility: 8,
      wedge: 6,
    }),
    makeCandidate("bold-and-clear", {
      clarity: 8,
      surprise: 9,
      urgency: 8,
      feasibility: 7,
      wedge: 9,
    }),
    makeCandidate("bland", {
      clarity: 9,
      surprise: 4,
      urgency: 7,
      feasibility: 9,
      wedge: 4,
    }),
  ];

  const selected = selectFinalCandidates(candidates, 3);

  assert.deepEqual(
    selected.map((candidate) => candidate.seed_id),
    ["bold-and-clear", "solid", "bland"],
  );
});

test("selectFinalCandidates backfills the next-best candidates when strict guardrails leave too few", () => {
  const candidates: ScoredIdeaSeed[] = [
    makeCandidate("passes", {
      clarity: 8,
      surprise: 8,
      urgency: 8,
      feasibility: 7,
      wedge: 8,
    }),
    makeCandidate("fallback-1", {
      clarity: 6,
      surprise: 9,
      urgency: 8,
      feasibility: 7,
      wedge: 9,
    }),
    makeCandidate("fallback-2", {
      clarity: 8,
      surprise: 7,
      urgency: 5,
      feasibility: 8,
      wedge: 7,
    }),
  ];

  const selected = selectFinalCandidates(candidates, 3);

  assert.deepEqual(
    selected.map((candidate) => candidate.seed_id),
    ["passes", "fallback-1", "fallback-2"],
  );
});

test("buildSeedGenerationPrompt asks for bold but understandable seeds", () => {
  const prompt = buildSeedGenerationPrompt(
    {
      who: ["주니어 개발자"],
      domain: ["에듀테크"],
      tech: ["LLM 에이전트"],
      value: ["스킬 향상"],
      money: ["구독형(SaaS)"],
    },
    "forced_pairing",
    ["기존 아이디어"],
  );

  assert.match(prompt.systemPrompt, /5초 안에 이해/);
  assert.match(prompt.systemPrompt, /generic AI SaaS/i);
  assert.match(prompt.userPrompt, /기존 아이디어/);
});

test("validateSeedGenerationResponse accepts well-formed seed payloads", () => {
  const seeds: RawIdeaSeed[] = Array.from({ length: 24 }, (_, index) => ({
    seed_id: `seed-${index + 1}`,
    target_user: `user-${index + 1}`,
    painful_moment: `pain-${index + 1}`,
    unusual_wedge: `wedge-${index + 1}`,
    why_now: `why-${index + 1}`,
    idea_nucleus: `nucleus-${index + 1}`,
  }));

  const validation = validateSeedGenerationResponse(
    JSON.stringify({
      run_type: "idea_seed_generation",
      prompt_version: "idea.v3.seed",
      keywords_used: ["주니어 개발자"],
      seeds,
    }),
  );

  assert.equal(validation.ok, true);
});

test("validateCuratedIdeaCandidatesResponse rejects malformed scored candidates", () => {
  const validCandidates = Array.from({ length: 9 }, (_, index) => ({
    seed_id: `seed-${index + 2}`,
    title: `제목-${index + 2}`,
    summary: `요약-${index + 2}`,
    target_user: `사용자-${index + 2}`,
    problem: `문제-${index + 2}`,
    solution_hint: `해법-${index + 2}`,
    clarity: 8,
    surprise: 8,
    urgency: 8,
    feasibility: 8,
    wedge: 8,
    shortlisting_reason: "좋음",
  }));

  const validation = validateCuratedIdeaCandidatesResponse(
    JSON.stringify({
      run_type: "idea_curation",
      prompt_version: "idea.v3.curate",
      keywords_used: ["주니어 개발자"],
      candidates: [
        {
          seed_id: "seed-1",
          title: "한 줄",
          summary: "요약",
          target_user: "사용자",
          problem: "문제",
          solution_hint: "해법",
          clarity: 8,
          surprise: 8,
          urgency: 8,
          feasibility: 8,
          // wedge missing on purpose
          shortlisting_reason: "좋음",
        },
        ...validCandidates,
      ],
    }),
  );

  assert.equal(validation.ok, false);
  if (!validation.ok) {
    assert.match(validation.error, /wedge/);
  }
});

test("buildCuratedIdeasPrompt includes the raw seeds to score and rewrite", () => {
  const prompt = buildCuratedIdeasPrompt(
    [
      {
        seed_id: "seed-1",
        target_user: "주니어 개발자",
        painful_moment: "반복 피드백",
        unusual_wedge: "팀별 코드리뷰 기억",
        why_now: "사내 문서가 쌓임",
        idea_nucleus: "팀 컨텍스트 코치",
      },
    ],
    ["주니어 개발자", "LLM 에이전트"],
    "full_match",
  );

  assert.match(prompt.systemPrompt, /clarity/i);
  assert.match(prompt.systemPrompt, /feasibility/i);
  assert.match(prompt.userPrompt, /seed-1/);
});

function makeCandidate(
  seed_id: string,
  scores: Pick<
    ScoredIdeaSeed,
    "clarity" | "surprise" | "urgency" | "feasibility" | "wedge"
  >,
): ScoredIdeaSeed {
  return {
    seed_id,
    shortlisting_reason: `${seed_id} reason`,
    title: `${seed_id} 제목`,
    summary: `${seed_id} 요약`,
    target_user: `${seed_id} 사용자`,
    problem: `${seed_id} 문제`,
    solution_hint: `${seed_id} 해법`,
    ...scores,
  };
}
