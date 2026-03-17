---
title: Roadmap
tags:
  - core
  - roadmap
  - phases
source: docs/04_Operations_Handbook.md
---

# Roadmap

> V1 MVP → V2 Enhancement. 게이트 기반 단계 전환.

---

## V1 (MVP)

**목표:** 핵심 루프(==생성 → 북마크 → 평가 → 축적==)를 웹에서 완결

핵심 범위:

- Next.js 웹앱 기본 구조 (대시보드, 생성, 목록, 상세, 키워드 관리)
- 고정 키워드 96개 DB 적재
- Full Match / Forced Pairing / Serendipity 생성 모드
- Deep Report(PRD) + 3중 구조 평가 매트릭스
- Firebase Firestore 연동 (5개 컬렉션)
- 최근 30일 제목 기반 중복 감지
- 아이디어 Kanban 상태 관리 + 14일 방치 감지
- Vercel 배포

### Done 기준

- [ ] 발산 세션이 저장까지 끊기지 않고 5회 연속 수행
- [ ] Deep Report + 평가가 같은 아이디어에 대해 3회 이상 완료
- [ ] 중복 경고, 저장 실패, 상태 전이 규칙이 충돌 없이 동작

---

## V2 (Enhancement)

V1 안정화 이후 착수.

- 다이내믹 키워드 자동 생성 파이프라인
- 임베딩 기반 중복 감지 (코사인 유사도 0.85)
- 사용자 선호 프로파일 + 추천 알고리즘 고도화
- 피드백 루프 분석 대시보드
- 키워드 사용 통계 시각화

---

## V2 착수 게이트

> [!important] 게이트 미충족 시 V2로 넘어가지 않는다

| 게이트 | 기준 |
|---|---|
| 루틴 정착 | 최근 4주 기준 주간 발산 세션 4회 이상 |
| 수렴 전환 | 최근 4주 기준 월간 Deep Report 4회 이상 |
| 품질 안정 | 중복 아이디어 비율 15% 미만 |
| 실행 연결 | 최소 1개 아이디어가 `실행` 또는 외부 검증 단계로 이동 |

---

## Go / Hold 의사결정

| 의사결정 | Go 조건 | Hold 조건 |
|---|---|---|
| V1 유지 | 발산 16회/28일, 중복률 15% 미만, Deep Report 4회/월 | 2개 이상 미달 |
| V2 착수 | V1 조건 + `실행` 1건/월 + API 비용 $30 이하 | 결과 지표 미달 또는 비용 초과 |
| 동적 키워드 | 수동 커스텀 추가 8건/28일, 키워드 풀 포화 | 커스텀도 소화 못함 |

---

## Related

- [[Project-Vision]] — 비전과 성공 기준
- [[Tech-Stack]] — 기술 스택 결정

## See Also

- [[V1-MVP-Plan]] — V1 상세 구현 계획 (06-Implementation)
- [[Success-Metrics]] — 성공 지표 (05-Operations)
