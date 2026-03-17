---
title: Prompt — Generation
tags:
  - ai-system
  - prompts
  - generation
status: Draft
---

# Prompt — Generation

> 아이디어 생성 프롬프트의 시스템/사용자 템플릿과 모델 선택을 정의한다.

---

## 시스템 프롬프트 (초안)

> [!note]
> Prompt Version: `idea.v1` — 구현 시 테스트 후 확정.

```
당신은 비즈니스 아이디어 생성 전문가입니다.

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
      "title": "제목",
      "summary": "한 줄 요약",
      "target_user": "타겟 사용자",
      "problem": "해결하려는 문제",
      "solution_hint": "솔루션 방향"
    }
  ]
}
```

---

## 사용자 프롬프트 템플릿

```
선택한 키워드: {keywords}
생성 모드: {mode}

최근 생성된 아이디어 (제외 대상):
{existing_titles}

위 키워드를 조합하여 10개의 비즈니스 아이디어를 생성해줘.
```

> [!tip]
> `{existing_titles}`에 최근 30일 제목을 포함하면 중복 아이디어 생성률을 크게 줄일 수 있다.

---

## 예시 입출력

### 입력 예시

```
선택한 키워드: Z세대, 핀테크, LLM 에이전트
생성 모드: full_match

최근 생성된 아이디어 (제외 대상):
- 소비 코치봇
- AI 가계부
```

### 출력 예시 (1개만 발췌)

```json
{
  "run_type": "idea_generation",
  "prompt_version": "idea.v1",
  "keywords_used": ["Z세대", "핀테크", "LLM 에이전트"],
  "ideas": [
    {
      "rank": 1,
      "title": "소비 버디",
      "summary": "지출 습관을 코치하는 Z세대용 금융 코파일럿",
      "target_user": "Z세대 대학생/사회초년생",
      "problem": "소비 통제와 기록이 잘 이어지지 않음",
      "solution_hint": "대화형 소비 피드백과 주간 리포트"
    }
  ]
}
```

---

## 모델

- ==o4-mini==: 빠르고 가성비 좋음. 창의적 생성에 적합.

---

## TODO

- [ ] 구현 시 실제 프롬프트 텍스트 확정
- [ ] 테스트 실행 및 출력 품질 검증
- [ ] Few-shot 예시 추가 여부 결정

---

## Related

- [[Prompt-Evaluation]] — 평가 프롬프트 상세 설계
- [[Prompt-Report]] — Deep Report 프롬프트 상세 설계
- [[Prompts-Overview]] — 프롬프트 설계 원칙 총괄

## See Also

- [[AI-Pipeline]] — 생성 단계가 위치하는 전체 파이프라인 (02-Architecture)
- [[Generation-Modes]] — 생성 모드별 키워드 조합 규칙 (03-Features)
