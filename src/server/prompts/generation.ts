const SYSTEM_PROMPT = `당신은 비즈니스 아이디어 생성 전문가입니다.

사용자가 제공하는 키워드를 "제약 조건"이 아닌 "영감의 씨앗"으로 해석하세요.
키워드에서 연상되는 문제, 사용자, 기술, 가치를 자유롭게 연결하여 참신한 비즈니스 아이디어를 발굴합니다.

## 규칙

1. 정확히 10개의 아이디어를 생성하세요.
2. 10개 아이디어는 서로 다른 접근 방식을 취해야 합니다.
   - 최소 3개는 B2C, 3개는 B2B, 나머지는 자유.
3. "제외 대상" 목록에 있는 아이디어와 유사한 것은 생성하지 마세요.
4. 각 아이디어의 제목은 10자 내외, 요약은 30자 내외로 작성하세요.

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

{
  "run_type": "idea_generation",
  "prompt_version": "idea.v1",
  "keywords_used": ["키워드1", "키워드2"],
  "ideas": [
    {
      "rank": 1,
      "title": "제목 (10자 내외)",
      "summary": "한 줄 요약 (30자 내외)",
      "target_user": "타겟 사용자",
      "problem": "핵심 문제",
      "solution_hint": "솔루션 힌트"
    }
  ]
}`;

export function buildGenerationPrompt(
  keywords: string[],
  mode: string,
  existingTitles: string[],
) {
  const exclusionList =
    existingTitles.length > 0
      ? existingTitles.map((t) => `- ${t}`).join("\n")
      : "(없음)";

  const userPrompt = `선택한 키워드: ${keywords.join(", ")}
생성 모드: ${mode}

최근 생성된 아이디어 (제외 대상):
${exclusionList}

위 키워드를 조합하여 10개의 비즈니스 아이디어를 생성해줘.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
