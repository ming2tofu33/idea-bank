import type { SearchResult } from "@/server/tavily";

const SYSTEM_PROMPT = `당신은 비즈니스 PRD(Product Requirements Document) 작성 전문가입니다.

아이디어의 제목, 요약, 사용된 키워드와 **실제 웹 검색 결과**를 기반으로 9개 섹션의 상세 보고서를 작성합니다.

## 규칙

1. 아래 9개 섹션을 빠짐없이 작성하세요.
2. 엘리베이터 피치는 3문장 이내로 작성하세요.
3. 경쟁 환경 분석에서 **제공된 검색 결과에 있는 실제 서비스**를 2~3개 언급하세요. 검색 결과에 없는 서비스를 지어내지 마세요.
4. 시장 규모나 성장률은 **검색 결과에 포함된 실제 데이터**를 인용하세요. 데이터가 없으면 "추가 조사 필요"로 표시하세요.
5. MVP 범위는 4주 내 구현 가능한 수준으로 제한하세요.
6. 리스크는 기술적/시장적 각 1개씩 구체적으로 작성하세요.
7. 수익 모델은 선택된 Money 키워드를 기반으로 구체화하세요.
8. 검색 결과의 트렌드 정보를 활용하여 현재 시장 상황을 반영하세요.

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요.

{
  "run_type": "deep_report",
  "prompt_version": "prd.v2",
  "idea_id": "아이디어 ID",
  "elevator_pitch": "3문장 이내 요약",
  "problem": "핵심 pain point",
  "solution": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
  "persona": { "name": "페르소나 이름", "context": "페르소나 상황" },
  "competition": [{ "name": "경쟁사", "difference": "차별점" }],
  "revenue_model": "수익 모델",
  "mvp_scope": ["기능 1", "기능 2"],
  "risks": { "technical": "기술 리스크", "market": "시장 리스크" },
  "resources": { "stack": ["기술1"], "timeline": "기간" }
}`;

export function buildReportPrompt(
  idea: {
    id: string;
    title: string;
    summary: string;
    keywords_used: string[];
    target_user: string;
    problem: string;
    solution_hint: string;
  },
  searchData?: {
    competitors: SearchResult[];
    market: SearchResult[];
    trends: SearchResult[];
  },
) {
  const competitorSection =
    searchData && searchData.competitors.length > 0
      ? searchData.competitors
          .map((r) => `- ${r.title} (${r.url})\n  ${r.content.slice(0, 300)}`)
          .join("\n")
      : "(검색 결과 없음)";

  const marketSection =
    searchData && searchData.market.length > 0
      ? searchData.market
          .map((r) => `- ${r.title}\n  ${r.content.slice(0, 300)}`)
          .join("\n")
      : "(검색 결과 없음)";

  const trendSection =
    searchData && searchData.trends.length > 0
      ? searchData.trends
          .map((r) => `- ${r.title}\n  ${r.content.slice(0, 300)}`)
          .join("\n")
      : "(검색 결과 없음)";

  const userPrompt = `아이디어 제목: ${idea.title}
아이디어 요약: ${idea.summary}
사용된 키워드: ${idea.keywords_used.join(", ")}
타겟 사용자: ${idea.target_user}
핵심 문제: ${idea.problem}
솔루션 힌트: ${idea.solution_hint}
아이디어 ID: ${idea.id}

## 웹 검색 결과 (실제 데이터)

### 경쟁사/유사 서비스
${competitorSection}

### 시장 규모/성장률
${marketSection}

### 최신 트렌드
${trendSection}

위 아이디어와 검색 결과를 기반으로 상세 PRD를 작성해줘. 경쟁사는 반드시 검색 결과에서 찾은 실제 서비스만 사용하세요.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
