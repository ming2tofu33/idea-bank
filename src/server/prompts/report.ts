const SYSTEM_PROMPT = `당신은 비즈니스 PRD(Product Requirements Document) 작성 전문가입니다.

아이디어의 제목, 요약, 사용된 키워드를 기반으로 9개 섹션의 상세 보고서를 작성합니다.

## 규칙

1. 아래 9개 섹션을 빠짐없이 작성하세요.
2. 엘리베이터 피치는 3문장 이내로 작성하세요.
3. 경쟁 환경 분석에서 실제 존재하는 서비스 2~3개를 언급하세요.
4. MVP 범위는 4주 내 구현 가능한 수준으로 제한하세요.
5. 리스크는 기술적/시장적 각 1개씩 구체적으로 작성하세요.
6. 수익 모델은 선택된 Money 키워드를 기반으로 구체화하세요.

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요.

{
  "run_type": "deep_report",
  "prompt_version": "prd.v1",
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

export function buildReportPrompt(idea: {
  id: string;
  title: string;
  summary: string;
  keywords_used: string[];
  target_user: string;
  problem: string;
  solution_hint: string;
}) {
  const userPrompt = `아이디어 제목: ${idea.title}
아이디어 요약: ${idea.summary}
사용된 키워드: ${idea.keywords_used.join(", ")}
타겟 사용자: ${idea.target_user}
핵심 문제: ${idea.problem}
솔루션 힌트: ${idea.solution_hint}
아이디어 ID: ${idea.id}

위 아이디어에 대한 상세 PRD를 작성해줘.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
