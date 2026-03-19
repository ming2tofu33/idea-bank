import type { RawIdeaSeed } from "@/server/generation-pipeline";
import type { CategorizedKeywords, GenerationMode } from "@/types";

function kwLine(label: string, arr: string[]): string | null {
  return arr.length > 0 ? `- ${label}: ${arr.join(", ")}` : null;
}

function flattenKeywords(categorizedKeywords: CategorizedKeywords): string[] {
  return [
    ...categorizedKeywords.who,
    ...categorizedKeywords.domain,
    ...categorizedKeywords.tech,
    ...categorizedKeywords.value,
    ...categorizedKeywords.money,
  ];
}

function buildModeSection(mode: GenerationMode, kw: CategorizedKeywords): string {
  switch (mode) {
    case "full_match": {
      const lines = [
        kwLine("타겟(Who)", kw.who),
        kwLine("분야(Domain)", kw.domain),
        kwLine("기술(Tech)", kw.tech),
        kwLine("가치(Value)", kw.value),
        kwLine("수익(Money)", kw.money),
      ]
        .filter(Boolean)
        .join("\n");

      return `## 모드: Full Match — 제약 조건 모드

선택된 모든 키워드를 아이디어에 반드시 반영해야 합니다.
키워드는 "영감"이 아닌 "요건"입니다.

${lines}`;
    }

    case "forced_pairing": {
      const pools = [
        kw.who.length > 0 ? `Who(${kw.who.join(", ")})` : null,
        kw.domain.length > 0 ? `Domain(${kw.domain.join(", ")})` : null,
        kw.tech.length > 0 ? `Tech(${kw.tech.join(", ")})` : null,
        kw.value.length > 0 ? `Value(${kw.value.join(", ")})` : null,
        kw.money.length > 0 ? `Money(${kw.money.join(", ")})` : null,
      ]
        .filter(Boolean)
        .join(", ");

      return `## 모드: Forced Pairing — 충돌 조합 모드

서로 어울리지 않아 보이는 카테고리를 의도적으로 충돌시켜 참신한 조합을 만드세요.
각 seed는 한 가지 강한 비틀기만 가져야 합니다.
키워드 풀: ${pools}`;
    }

    case "serendipity": {
      const allFlat = flattenKeywords(kw).join(", ");

      return `## 모드: Serendipity — 자유 연상 모드

아래 키워드는 힌트입니다. 키워드를 직접 쓰지 않아도 됩니다.
의외의 연결고리를 찾되, 문제와 사용자가 빠르게 이해되어야 합니다.
힌트 키워드: ${allFlat}`;
    }
  }
}

export function buildSeedGenerationPrompt(
  categorizedKeywords: CategorizedKeywords,
  mode: GenerationMode,
  existingTitles: string[],
) {
  const modeSection = buildModeSection(mode, categorizedKeywords);
  const allKeywords = flattenKeywords(categorizedKeywords);
  const exclusionList =
    existingTitles.length > 0
      ? existingTitles.map((t) => `- ${t}`).join("\n")
      : "(없음)";

  const systemPrompt = `당신은 brilliant한 한 줄 비즈니스 아이디어를 위한 원석을 발굴하는 전문가입니다.

Brilliant의 기준:
- 처음 보면 약간 의외하지만 5초 안에 이해된다.
- 누가 왜 필요로 하는지 바로 보인다.
- 문제와 wedge가 선명하다.

피해야 할 것:
- generic AI SaaS
- 기술이 먼저 보이는 아이디어
- 설명이 길어야 이해되는 아이디어
- 지나치게 공상적이거나 실행 가능성이 낮은 아이디어

${modeSection}

## 작업

1. 정확히 24개의 raw seed를 생성하세요.
2. polished한 카피보다 문제, 사용자, wedge가 살아 있는 원석을 만드세요.
3. 서로 다른 접근 방식을 유지하세요.
4. brilliant하지만 난해하지 않게 만드세요.

## 출력 형식

반드시 JSON만 출력하세요.

{
  "run_type": "idea_seed_generation",
  "prompt_version": "idea.v3.seed",
  "keywords_used": ["실제로 활용한 키워드1", "키워드2"],
  "seeds": [
    {
      "seed_id": "seed-1",
      "target_user": "누구를 위한지",
      "painful_moment": "가장 아픈 순간",
      "unusual_wedge": "의외의 진입점",
      "why_now": "지금 가능한 이유",
      "idea_nucleus": "아이디어 핵심"
    }
  ]
}`;

  const userPrompt = `최근 생성된 아이디어 (제외 대상):
${exclusionList}

실제로 고려할 키워드:
${allKeywords.map((keyword) => `- ${keyword}`).join("\n")}

위 모드와 키워드를 기반으로 24개의 raw seed를 생성해줘.`;

  return { systemPrompt, userPrompt };
}

export function buildCuratedIdeasPrompt(
  seeds: RawIdeaSeed[],
  keywordsUsed: string[],
  mode: GenerationMode,
) {
  const serializedSeeds = seeds
    .map(
      (seed) => `- ${seed.seed_id}
  - target_user: ${seed.target_user}
  - painful_moment: ${seed.painful_moment}
  - unusual_wedge: ${seed.unusual_wedge}
  - why_now: ${seed.why_now}
  - idea_nucleus: ${seed.idea_nucleus}`,
    )
    .join("\n");

  const systemPrompt = `당신은 raw 아이디어 원석을 선별해 final one-line idea로 다듬는 편집자입니다.

평가 기준:
- clarity: 5초 안에 이해되는가
- surprise: 너무 뻔하지 않은가
- urgency: 실제 아픈 문제인가
- feasibility: 현실적인 제품/서비스로 만들 수 있는가
- wedge: 남과 다른 진입점이 선명한가

원칙:
- surprise를 높이되 clarity와 feasibility를 절대 버리지 마세요.
- generic AI SaaS는 버리세요.
- 문제보다 기술이 먼저 보이는 아이디어는 버리세요.
- 한 줄로 설명이 안 되는 아이디어는 버리세요.

## 작업

1. 주어진 raw seed 중 강한 후보를 골라 scored candidate로 정리하세요.
2. 각 candidate에 clarity, surprise, urgency, feasibility, wedge를 1-10 점수로 매기세요.
3. 각 candidate를 최종 한 줄 아이디어 형태로 재작성하세요.
4. 최소 12개의 candidate를 반환하세요.

## 출력 형식

반드시 JSON만 출력하세요.

{
  "run_type": "idea_curation",
  "prompt_version": "idea.v3.curate",
  "keywords_used": ["키워드1", "키워드2"],
  "candidates": [
    {
      "seed_id": "seed-1",
      "title": "제목 (10자 내외)",
      "summary": "한 줄 요약 (30자 내외)",
      "target_user": "타겟 사용자",
      "problem": "핵심 문제",
      "solution_hint": "솔루션 힌트",
      "clarity": 8,
      "surprise": 8,
      "urgency": 8,
      "feasibility": 7,
      "wedge": 9,
      "shortlisting_reason": "왜 brilliant하지만 난해하지 않은지"
    }
  ]
}`;

  const userPrompt = `모드: ${mode}
활용 키워드: ${keywordsUsed.join(", ")}

아래 raw seed를 점수화하고 final candidate로 다듬어줘:
${serializedSeeds}`;

  return { systemPrompt, userPrompt };
}
