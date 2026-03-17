---
title: Prompts Overview
tags:
  - ai-system
  - prompts
source: docs/03_Backend_AI_Spec.md
---

# Prompts Overview

> AI 프롬프트 설계 원칙, 버전 관리 전략, JSON 검증 규칙을 정의하는 시스템 문서.

---

## 프롬프트 설계 원칙

### 아이디어 생성

- 키워드 조합을 =="제약"이 아니라 "영감의 씨앗"==으로 해석하도록 지시
- ==10개 아이디어==가 서로 다른 접근 방식을 취하도록 강제 (최소 3개 B2C, 3개 B2B, 나머지 자유)
- 이전 생성 아이디어 제목을 컨텍스트에 포함해 중복을 줄임
- 각 아이디어는 `제목(10자 내외) + 한 줄 요약(30자 내외)` 형식 유지

### 평가

- 반드시 ==`근거 + 반론 + 확인 필요` 3중 구조== 출력 강제
- 확신할 수 없는 부분은 점수 왜곡보다 `확인 필요`에 명시하도록 지시
- 평가 시 해당 아이디어의 PRD를 컨텍스트에 포함
- 점수 인플레이션 방지를 위해 ==`60점이 평균`== 기준선 명시
- 2개 이상의 few-shot 예시로 점수 인플레이션과 낙관 편향을 줄임

> [!important]
> 평가 프롬프트에는 반드시 few-shot 예시를 포함하여 점수 인플레이션을 방지해야 한다.

---

## 프롬프트 버전 관리

- 모든 응답은 `prompt_version`과 `run_type`을 payload에 포함
- 아이디어 생성, PRD, 평가는 각각 독립된 prompt template 사용
- 버전 형식: `{type}.v{number}` (예: `idea.v1`, `prd.v1`, `eval.v1`)
- 프롬프트 변경 시 버전을 올리고, ==ai_runs에 기록==

---

## JSON 검증

- Firestore 저장 전 JSON schema 검증을 통과해야 함
- 검증 실패 시 ==1회 same-input 재시도==
- 이후에도 실패하면 `validation_status=failed`로 종료

> [!warning]
> 검증 실패가 반복되면 프롬프트 자체의 출력 포맷을 재검토해야 한다.

---

## 프롬프트 파일 구조

```text
src/lib/prompts/
├── generation.ts    ← 아이디어 생성 프롬프트
├── evaluation.ts    ← 평가 프롬프트
└── report.ts        ← Deep Report 프롬프트
```

각 파일은 시스템 프롬프트와 사용자 프롬프트를 분리하여 관리한다.

---

## Related

- [[Prompt-Generation]] — 아이디어 생성 프롬프트 상세 설계
- [[Prompt-Evaluation]] — 평가 프롬프트 상세 설계
- [[Response-Contracts]] — AI 응답 JSON 스키마 정의

## See Also

- [[AI-Pipeline]] — 전체 AI 파이프라인 아키텍처 (02-Architecture)
- [[Evaluation-Matrix]] — 평가 매트릭스 기능 명세 (03-Features)
