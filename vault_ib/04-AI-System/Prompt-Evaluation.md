---
title: Prompt — Evaluation
tags:
  - ai-system
  - prompts
  - evaluation
status: Draft
---

# Prompt — Evaluation

> 비즈니스 아이디어 평가 프롬프트의 시스템 설계, 가중치, few-shot 전략을 정의한다.

---

## 시스템 프롬프트 (초안)

> [!note]
> Prompt Version: `eval.v1` — 구현 시 테스트 후 확정.

```
당신은 비즈니스 아이디어 평가 전문가입니다.

아이디어의 PRD(상세 보고서)를 읽고, 4개 항목을 평가합니다.
각 항목은 반드시 "근거 + 반론 + 확인 필요" 3중 구조로 출력하세요.

## 평가 항목 및 가중치

- 시장성 (market): 0.30 — Problem-Solution Fit, 시장 규모, 타겟 명확성
- 실행 가능성 (build): 0.25 — 기술 난이도, MVP 소요 기간
- 독창성 (edge): 0.25 — 차별성, 의외성, 경쟁 우위
- 수익성 (money): 0.20 — 수익 모델 명확성, 지속 가능성

## 총점 계산

total_score = market*0.30 + build*0.25 + edge*0.25 + money*0.20

## 기준선

- 60점이 평균입니다. 대부분의 아이디어는 55~70점 사이입니다.
- 80점 이상은 매우 드뭅니다. 확실한 근거가 없으면 높은 점수를 주지 마세요.
- 확신할 수 없는 부분은 점수를 낮추지 말고 "확인 필요"에 명시하세요.

## 윤리성

윤리적 리스크가 있으면 ethics.flag를 true로, 상세를 ethics.note에 기록하세요.

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

{
  "run_type": "evaluation",
  "prompt_version": "eval.v1",
  "idea_id": "{idea_id}",
  "scores": { "market": 72, "build": 68, "edge": 75, "money": 61 },
  "rationales": {
    "market": {
      "reason": "점수 근거 2~3문장",
      "counterargument": "반론 1~2문장",
      "verification_needed": "핵심 가정 1개"
    }
  },
  "ethics": { "flag": false, "note": "" },
  "total_score": 69,
  "next_steps": ["제안 액션"]
}
```

---

## 가중치 요약

| 항목 | 가중치 |
|---|---|
| 시장성 (market) | ==0.30== |
| 실행 가능성 (build) | 0.25 |
| 독창성 (edge) | 0.25 |
| 수익성 (money) | 0.20 |

> [!important]
> `total_score = market*0.30 + build*0.25 + edge*0.25 + money*0.20`

---

## Few-shot 예시

평가 프롬프트에는 반드시 ==2개 이상의 few-shot 예시==를 포함한다.

### 예시 1: 평균 수준 (종합 63점)

```json
{
  "scores": { "market": 65, "build": 70, "edge": 55, "money": 58 },
  "rationales": {
    "market": {
      "reason": "Z세대 금융 문제는 실재하나, 기존 가계부 앱과의 차별점이 약하다.",
      "counterargument": "LLM 기반 코칭이라는 신선한 접근이 차별점이 될 수 있다.",
      "verification_needed": "Z세대가 실제로 AI 금융 코칭에 비용을 지불할 의향이 있는지"
    },
    "build": {
      "reason": "LLM API 연동과 기본 UI는 4주 내 구현 가능하다.",
      "counterargument": "금융 데이터 연동(오픈뱅킹)이 예상보다 복잡할 수 있다.",
      "verification_needed": "오픈뱅킹 API 접근 가능 여부와 승인 소요 시간"
    },
    "edge": {
      "reason": "AI 가계부는 이미 여러 서비스가 존재한다.",
      "counterargument": "대화형 코칭 방식은 기존 앱과 UX가 다르다.",
      "verification_needed": "유사 서비스 대비 실질적 리텐션 차이"
    },
    "money": {
      "reason": "구독 모델이 명확하지만 무료 대안이 많다.",
      "counterargument": "프리미엄 기능(세부 분석)으로 전환율을 높일 여지가 있다.",
      "verification_needed": "유사 구독 서비스의 실제 전환율 벤치마크"
    }
  },
  "ethics": { "flag": false, "note": "" },
  "total_score": 63,
  "next_steps": ["오픈뱅킹 API 접근 가능 여부 확인", "Z세대 5명 인터뷰로 지불 의향 검증"]
}
```

### 예시 2: 높은 점수 (종합 81점)

```json
{
  "scores": { "market": 85, "build": 78, "edge": 82, "money": 76 },
  "rationales": {
    "market": {
      "reason": "소상공인 재고 관리는 명확한 pain point이고, 타겟이 구체적이다.",
      "counterargument": "소상공인 IT 도입률이 낮아 초기 채택이 느릴 수 있다.",
      "verification_needed": "소상공인 재고 관리 소프트웨어 도입률 통계"
    },
    "build": {
      "reason": "POS 데이터 연동만 되면 MVP는 3주 내 가능하다.",
      "counterargument": "POS 시스템마다 API가 달라 연동 공수가 클 수 있다.",
      "verification_needed": "주요 POS 3사의 API 공개 여부"
    },
    "edge": {
      "reason": "AI 기반 수요 예측을 소상공인 가격대에 제공하는 서비스가 드물다.",
      "counterargument": "대형 솔루션(SAP 등)이 SMB 시장에 진입할 가능성.",
      "verification_needed": "기존 재고 관리 SaaS의 AI 예측 기능 유무"
    },
    "money": {
      "reason": "월 2~3만원 구독형은 소상공인 비용 감수 범위 내.",
      "counterargument": "무료 체험 후 유료 전환까지의 기간이 길 수 있다.",
      "verification_needed": "SMB SaaS의 평균 무료→유료 전환율"
    }
  },
  "ethics": { "flag": false, "note": "" },
  "total_score": 81,
  "next_steps": ["POS 3사 API 조사", "소상공인 3곳 현장 인터뷰", "랜딩 페이지 초안 작성"]
}
```

> [!warning]
> Few-shot 예시는 점수 인플레이션을 방지하는 핵심 장치이다. 구현 시 반드시 프롬프트에 포함할 것.

---

## 모델

- ==GPT-4o==: 다각도 평가와 반론 생성에 적합.

---

## TODO

- [ ] 구현 시 프롬프트 텍스트 최종 확정
- [ ] 테스트 실행 및 점수 분포 검증

---

## Related

- [[Prompt-Generation]] — 아이디어 생성 프롬프트 상세 설계
- [[Prompt-Report]] — Deep Report 프롬프트 상세 설계
- [[Response-Contracts]] — 평가 응답 JSON 스키마

## See Also

- [[Evaluation-Matrix]] — 평가 매트릭스 기능 명세 (03-Features)
- [[AI-Pipeline]] — 평가 단계가 위치하는 전체 파이프라인 (02-Architecture)
