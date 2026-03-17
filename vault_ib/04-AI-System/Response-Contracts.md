---
title: Response Contracts
tags:
  - ai-system
  - contracts
  - json
source: docs/03_Backend_AI_Spec.md
---

# Response Contracts

> AI 모델 응답의 JSON 스키마를 정의하고, 검증 규칙을 명시하는 계약 문서.

---

## 1. 아이디어 생성 (`idea_generation`)

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
      "target_user": "Z세대",
      "problem": "소비 통제와 기록이 잘 이어지지 않음",
      "solution_hint": "대화형 소비 피드백과 주간 리포트"
    }
  ]
}
```

### 필수 필드

| 필드 | 타입 | 제약 |
|---|---|---|
| `run_type` | string | `"idea_generation"` 고정 |
| `prompt_version` | string | `"idea.v{n}"` 형식 |
| `keywords_used` | string[] | 비어있으면 안됨 |
| `ideas` | array | ==정확히 10개== |
| `ideas[].rank` | number | 1~10 |
| `ideas[].title` | string | 10자 내외 |
| `ideas[].summary` | string | 30자 내외 |

---

## 2. Deep Report (`deep_report`)

```json
{
  "run_type": "deep_report",
  "prompt_version": "prd.v1",
  "idea_id": "idea_123",
  "elevator_pitch": "3문장 이내 요약",
  "problem": "핵심 pain point",
  "solution": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
  "persona": {
    "name": "Z세대 대학생",
    "context": "모바일 금융 서비스에 익숙하지만 계획 소비가 어려움"
  },
  "competition": [
    { "name": "Competitor A", "difference": "차별점 요약" }
  ],
  "revenue_model": "구독형",
  "mvp_scope": ["기능 1", "기능 2"],
  "risks": {
    "technical": "기술 리스크",
    "market": "시장 리스크"
  },
  "resources": {
    "stack": ["Next.js", "Firebase"],
    "timeline": "4주"
  }
}
```

> [!note]
> `solution` 배열은 정확히 3개, `competition` 배열은 2~3개를 권장한다.

---

## 3. 평가 (`evaluation`)

```json
{
  "run_type": "evaluation",
  "prompt_version": "eval.v1",
  "idea_id": "idea_123",
  "scores": {
    "market": 72,
    "build": 68,
    "edge": 75,
    "money": 61
  },
  "rationales": {
    "market": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "build": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "edge": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "money": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    }
  },
  "ethics": {
    "flag": false,
    "note": ""
  },
  "total_score": 69,
  "next_steps": ["확인 필요 항목 우선 리서치"]
}
```

> [!important]
> 각 `rationales` 항목은 반드시 ==`reason` + `counterargument` + `verification_needed`== 3중 구조를 포함해야 한다.

---

## 4. 검증 규칙

- 저장 전 반드시 위 스키마에 맞는지 검증
- 검증 실패 시 ==1회 same-input 재시도==
- 이후 실패 시 `validation_status=failed`로 기록

---

## Related

- [[Prompts-Overview]] — 프롬프트 설계 원칙 총괄
- [[Prompt-Generation]] — 아이디어 생성 프롬프트 상세

## See Also

- [[AI-Pipeline]] — JSON 검증이 수행되는 파이프라인 위치 (02-Architecture)
- [[Evaluation-Matrix]] — 평가 점수가 사용되는 기능 명세 (03-Features)
