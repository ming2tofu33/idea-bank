---
title: Serendipity
tags:
  - features
  - recommendation
  - mvp
source: docs/02_Idea_System_Spec.md
---

# Serendipity

> 매일 아침 ==결정 피로를 줄이기 위한 추천 조합== 기능의 점수식, 필터, 데이터 소스를 정의한다.

---

## 핵심 동작

1. 앱 열기 시 ==추천 조합 3세트== 표시
2. 추천 수락 또는 직접 키워드 선택
3. 수락 시 곧바로 생성으로 이어짐

## 추천 점수식

```
serendipity_score = novelty(0.5) + diversity(0.3) + recency_penalty(0.2)
```

| 요소 | 가중치 | 판정 규칙 |
|------|--------|-----------|
| **novelty** | ==0.5== | 최근 30일 내 미사용 조합일수록 높게 부여 |
| **diversity** | ==0.3== | 최근 14일간 자주 등장하지 않은 카테고리 조합일수록 높게 부여 |
| **recency_penalty** | ==0.2== | 직전 7일간 동일 키워드 재등장 비율이 높을수록 감점 |

## 추천 후보 필터

> [!important]
> 아래 필터를 통과한 조합만 추천 후보로 노출된다.

- 최근 7일간 ==동일 조합 재노출 금지==
- 동일 카테고리 내부 의미 중복 키워드 동시 사용 금지
- 동적 키워드는 검증 전 ==최대 1개==까지만 포함 (V2)

## 데이터 소스

추천 로직에 필요한 데이터:

| 데이터 | 소스 | 쿼리 |
|--------|------|------|
| 키워드별 사용 횟수 | `keywords` 컬렉션 `used_count` | category별 used_count asc |
| 최근 세션 키워드 | `sessions` 컬렉션 | 최근 30일 sessions → keywords_selected |
| 최근 아이디어 키워드 | `ideas` 컬렉션 | 최근 7일 ideas → keywords_used |

## 초기 상태 (First Run) 처리

> [!note]
> 사용 이력이 없는 초기 상태에서는 점수 기반 추천을 사용할 수 없다.

- novelty, diversity, recency_penalty 모두 ==0으로 처리==
- 각 카테고리에서 1개씩 랜덤 선택하여 3세트 생성
- ==5회 이상 세션 기록==이 쌓이면 점수 기반 추천으로 전환

## Related

- [[Generation-Modes]] — Serendipity를 포함한 3가지 생성 모드 개요
- [[Keyword-System]] — 추천 대상이 되는 키워드 풀 구조
- [[Idea-Lifecycle]] — 추천 수락 후 아이디어의 상태 전이

## See Also

- [[Database-Schema]] — keywords, sessions, ideas 컬렉션 스키마 (02-Architecture)
- [[Session-Flow]] — 아침 발산 세션에서 Serendipity가 사용되는 흐름 (05-Operations)
