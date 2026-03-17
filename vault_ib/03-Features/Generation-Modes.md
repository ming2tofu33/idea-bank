---
title: Generation Modes
tags:
  - features
  - generation
  - mvp
source: docs/02_Idea_System_Spec.md
---

# Generation Modes

> 키워드 조합으로 아이디어를 생성하는 ==3가지 모드==(Full Match, Forced Pairing, Serendipity)를 정의한다.

---

## Full Match

사용자가 선택한 ==모든 키워드를 반드시 반영==해 아이디어를 생성한다.

> [!note]
> 적합한 상황:
> - 특정 제약 조건을 모두 반영한 아이디어를 보고 싶을 때
> - 문제 정의가 비교적 선명할 때

## Forced Pairing

`고정 키워드 2개 + 커스텀 키워드 1개` 조합을 강제해 ==의외성 있는 아이디어==를 끌어낸다.

> [!note]
> 적합한 상황:
> - 평소 떠올리지 않는 조합을 보고 싶을 때
> - 의도적 충돌이나 신선한 발상을 유도하고 싶을 때

### Fallback 규칙

> [!important]
> 아래 규칙은 순서대로 적용된다.

- 커스텀 키워드가 ==없으면== `고정 키워드 3개` 조합으로 대체
- 커스텀 키워드가 2개 이상이면 ==최근 14일간 사용 빈도가 가장 낮은 항목== 우선
- 최근 30일 내 같은 조합이 이미 쓰였다면 다음 후보 조합으로 넘어감

## Serendipity (추천 조합)

> [!tip]
> 상세 로직은 [[Serendipity]] 참조.

결정 피로를 줄이기 위한 ==추천 조합 중심== 모드.

- 이전에 사용하지 않은 조합을 우선 제안
- 최근 자주 선택한 키워드와 일부러 다른 조합을 섞음
- 추천 조합 수락 후 곧바로 생성으로 이어짐

## Related

- [[Keyword-System]] — 생성 모드가 소비하는 키워드 풀 구조
- [[Serendipity]] — Serendipity 모드의 추천 점수 및 필터 로직
- [[Idea-Lifecycle]] — 생성된 아이디어의 상태 전이 흐름

## See Also

- [[Prompt-Generation]] — 모드별 프롬프트 구성 로직 (04-AI-System)
- [[Session-Flow]] — 발산/수렴 세션에서 모드가 사용되는 흐름 (05-Operations)
