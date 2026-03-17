---
title: Prompt — Deep Report
tags:
  - ai-system
  - prompts
  - report
status: Draft
---

# Prompt — Deep Report

> 비즈니스 PRD(Deep Report) 생성 프롬프트의 시스템 설계와 9개 섹션 구조를 정의한다.

---

## 시스템 프롬프트 (초안)

> [!note]
> Prompt Version: `prd.v1` — 구현 시 테스트 후 확정.

```
당신은 비즈니스 PRD(Product Requirements Document) 작성 전문가입니다.

아이디어의 제목, 요약, 사용된 키워드를 기반으로 9개 섹션의 상세 보고서를 작성합니다.

## 규칙

1. 아래 9개 섹션을 빠짐없이 작성하세요.
2. 엘리베이터 피치는 3문장 이내로 작성하세요.
3. 경쟁 환경 분석에서 실제 존재하는 서비스 2~3개를 언급하세요.
4. MVP 범위는 4주 내 구현 가능한 수준으로 제한하세요.
5. 리스크는 기술적/시장적 각 1개씩 구체적으로 작성하세요.
6. 수익 모델은 선택된 Money 키워드를 기반으로 구체화하세요.

## 9개 섹션

1. 아이디어 요약 (엘리베이터 피치)
2. 문제 정의 (타겟의 Pain Point)
3. 솔루션 개요 (핵심 기능 3가지)
4. 타겟 사용자 페르소나 (이름 + 컨텍스트)
5. 경쟁 환경 분석 (실제 서비스 2~3개, 차별점)
6. 수익 모델
7. MVP 범위 (4주 내 구현 가능한 최소 기능)
8. 핵심 리스크 (기술적 1개 + 시장적 1개)
9. 필요 리소스 (기술 스택 + 타임라인)

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트를 포함하지 마세요.

{
  "run_type": "deep_report",
  "prompt_version": "prd.v1",
  "idea_id": "{idea_id}",
  "elevator_pitch": "3문장 이내",
  "problem": "핵심 pain point",
  "solution": ["기능1", "기능2", "기능3"],
  "persona": { "name": "이름", "context": "맥락" },
  "competition": [{ "name": "서비스명", "difference": "차별점" }],
  "revenue_model": "수익 모델",
  "mvp_scope": ["기능1", "기능2"],
  "risks": { "technical": "기술 리스크", "market": "시장 리스크" },
  "resources": { "stack": ["기술1"], "timeline": "4주" }
}
```

---

## 사용자 프롬프트 템플릿

```
아이디어 제목: {title}
아이디어 요약: {summary}
사용된 키워드: {keywords}
타겟 사용자: {target_user}
핵심 문제: {problem}
솔루션 힌트: {solution_hint}

위 아이디어에 대한 상세 PRD를 작성해줘.
```

---

## 예시 출력 (발췌)

```json
{
  "run_type": "deep_report",
  "prompt_version": "prd.v1",
  "idea_id": "idea_001",
  "elevator_pitch": "소비 버디는 Z세대를 위한 AI 금융 코파일럿입니다. 대화형 인터페이스로 지출 습관을 분석하고, 매주 맞춤형 소비 리포트를 제공합니다. 무의식적 과소비를 줄이고 저축 습관을 형성하는 것이 목표입니다.",
  "problem": "Z세대는 모바일 결제에 익숙하지만 지출 추적과 계획 소비가 잘 이어지지 않는다",
  "solution": [
    "대화형 지출 피드백 (일일 소비 요약)",
    "주간 소비 패턴 리포트",
    "목표 저축액 설정 및 진행도 시각화"
  ],
  "persona": {
    "name": "김하은 (24세, 대학생)",
    "context": "카드 결제 위주, 월 생활비 80만원, 매달 말 잔액 부족을 겪음"
  },
  "competition": [
    { "name": "뱅크샐러드", "difference": "AI 코칭 대화 기능 부재, 단순 조회 중심" },
    { "name": "토스 소비리포트", "difference": "주간 리포트만 있고 실시간 피드백 없음" }
  ],
  "revenue_model": "프리미엄 구독 (기본 무료, 상세 분석/목표 관리 월 3,900원)",
  "mvp_scope": ["카드 지출 연동", "일일 대화형 요약", "주간 리포트"],
  "risks": {
    "technical": "오픈뱅킹 API 연동 승인에 2~4주 소요 가능",
    "market": "무료 가계부 앱 대비 유료 전환 동기 부족 가능성"
  },
  "resources": {
    "stack": ["Next.js", "Firebase", "OpenAI API"],
    "timeline": "4주"
  }
}
```

---

## 모델

- ==GPT-4o==: 복잡한 분석과 구조화된 보고서에 적합.

---

## TODO

- [ ] 구현 시 프롬프트 텍스트 최종 확정
- [ ] 테스트 실행 및 출력 품질 검증

---

## Related

- [[Prompt-Generation]] — 아이디어 생성 프롬프트 상세 설계
- [[Prompt-Evaluation]] — 평가 프롬프트 상세 설계
- [[Response-Contracts]] — Deep Report 응답 JSON 스키마

## See Also

- [[Deep-Report]] — Deep Report 기능 명세 (03-Features)
- [[AI-Pipeline]] — 보고서 생성 단계가 위치하는 전체 파이프라인 (02-Architecture)
