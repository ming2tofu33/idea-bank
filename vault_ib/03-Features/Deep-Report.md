---
title: Deep Report
tags:
  - features
  - prd
  - mvp
source: docs/03_Backend_AI_Spec.md
---

# Deep Report

> 북마크된 아이디어를 ==9개 섹션 PRD==로 확장하는 수렴 세션용 보고서 기능을 정의한다.

---

## 목적

북마크된 아이디어를 선택해 ==상세 보고서(PRD)==로 확장한다. 수렴 세션에서 사용.

## 템플릿 구조

> [!important]
> PRD는 반드시 아래 9개 섹션 순서를 따른다.

1. **아이디어 요약** — 엘리베이터 피치, 3문장 이내
2. **문제 정의** — 타겟의 Pain Point
3. **솔루션 개요** — 핵심 기능 3가지
4. **타겟 사용자 페르소나** — 1개
5. **경쟁 환경 분석** — 유사 서비스 2~3개, 차별점
6. **수익 모델** — 선택된 Money 키워드 기반 구체화
7. **MVP 범위** — ==4주 내 구현 가능한 최소 기능==
8. **핵심 리스크** — 기술적/시장적 리스크 각 1개
9. **필요 리소스** — 기술 스택, 예상 개발 기간

## JSON 응답 계약

> [!note]
> AI 응답은 반드시 아래 JSON 구조를 따라야 한다.

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
    {
      "name": "Competitor A",
      "difference": "차별점 요약"
    }
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

## 사용 모델

- ==GPT-4o==: 복잡한 분석과 9개 섹션 구조화에 적합
- **입력**: 아이디어 요약 + 사용 키워드 + 생성 모드
- **출력**: 위 JSON 형식

## Related

- [[Evaluation-Matrix]] — Deep Report 생성 후 아이디어를 평가하는 매트릭스
- [[Idea-Lifecycle]] — PRD 생성이 트리거하는 상태 전이 규칙

## See Also

- [[Response-Contracts]] — AI 응답 JSON 계약 전체 정의 (04-AI-System)
- [[AI-Pipeline]] — Deep Report 생성 파이프라인 흐름 (02-Architecture)
