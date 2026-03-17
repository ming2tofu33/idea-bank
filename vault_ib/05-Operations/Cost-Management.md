---
title: Cost Management
tags:
  - operations
  - cost
  - budget
source: docs/04_Operations_Handbook.md
---

# Cost Management

> 인프라 비용 구조, OpenAI API 비용 추정, 월간 상한, 모니터링 전략을 정의한다.

---

## 인프라 비용 구조

| 서비스 | 플랜 | 월 비용 |
|---|---|---|
| Vercel | Hobby (무료) | ==$0== |
| Firebase Firestore | Spark (무료) | ==$0== |
| OpenAI API | Pay-as-you-go | 변동 |

> [!note]
> V1 단계에서는 Vercel과 Firebase 무료 티어로 인프라 비용이 발생하지 않는다.

---

## OpenAI API 비용 추정

| 항목 | 빈도 | 모델 | 예상 토큰 | 월간 비용(추정) |
|---|---|---|---|---|
| 아침 발산 세션 | 매일 | o4-mini | ~2K in + ~2K out | ~$3~5 |
| Deep Report | 주 2회 | GPT-4o | ~3K in + ~4K out | ~$2~4 |
| 비즈니스 평가 | 주 2회 | GPT-4o | ~3K in + ~3K out | ~$2~3 |
| **월간 합계** | | | | ==**~$7~12**== |

> [!tip]
> 실제 비용은 모델 가격 변동에 따라 달라질 수 있음. `ai_runs` 로그로 실제 사용량을 추적한다.

---

## 비용 상한

| 항목 | 상한 |
|---|---|
| 월간 API 예산 | ==$30== |
| Deep Report 생성 | 주 5회 |
| 일일 발산 세션 | 1회 (추가 시 경고) |

> [!warning]
> $30 상한의 80% 도달 시 경고를 표시하고, 상한 초과 시 API 호출을 차단한다.

---

## 비용 모니터링

- `ai_runs` 컬렉션에 매 호출의 `input_tokens`, `output_tokens` 기록
- 월간 누적 비용 = 토큰 수 × 모델별 단가로 계산
- 대시보드에 월간 사용량/잔여 예산 표시 (V1에서는 간단한 수치)
- ==$30 상한의 80% 도달 시 경고==

---

## Related

- [[Session-Flow]] — 세션별 API 호출 빈도 정의
- [[Success-Metrics]] — 비용 효율 관련 KPI

## See Also

- [[Roadmap]] — 비용 관련 마일스톤 (01-Core)
- [[Idea-Lifecycle]] — 아이디어 상태별 API 호출 시점 (03-Features)
