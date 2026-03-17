---
title: V1 MVP Plan
tags:
  - implementation
  - mvp
  - v1
---

# V1 MVP Plan

> 핵심 루프(키워드 선택 → 아이디어 생성 → 북마크 → Deep Report → 평가 → 축적)를 구현하는 V1 MVP 체크리스트.

---

## V1 범위

핵심 루프: ==**키워드 선택 → 아이디어 생성 → 북마크 → Deep Report → 평가 → 축적**==

---

## 인프라

- [ ] Next.js 프로젝트 초기화 (App Router, Tailwind, shadcn/ui)
- [ ] Firebase Firestore 설정 및 연결
- [ ] OpenAI API 연동 (o4-mini, GPT-4o)
- [ ] Vercel 배포 설정

---

## 백엔드 (API Routes)

- [ ] `POST /api/generate` — 아이디어 생성
- [ ] `GET/POST /api/ideas` — 아이디어 CRUD
- [ ] `PATCH /api/ideas/[id]` — 상태 변경, 북마크
- [ ] `POST /api/report` — Deep Report 생성
- [ ] `POST /api/evaluate` — 평가 실행
- [ ] `GET/POST/DELETE /api/keywords` — 키워드 CRUD
- [ ] JSON 응답 검증 로직
- [ ] 에러 처리 및 재시도 로직

---

## 프론트엔드 (페이지)

- [ ] 공통 레이아웃 (사이드바 네비게이션)
- [ ] `/` 대시보드 (추천 조합, 최근 활동)
- [ ] `/generate` 발산 세션 (키워드 선택 → 생성 → 북마크)
- [ ] `/ideas` 목록 (Kanban / 리스트 뷰, 필터)
- [ ] `/ideas/[id]` 상세 (Deep Report + 평가)
- [ ] `/keywords` 키워드 관리

---

## 기능

- [ ] Full Match / Forced Pairing 생성 모드
- [ ] Serendipity 추천 조합
- [ ] ==3중 구조 평가 매트릭스==
- [ ] Next Step 제안
- [ ] 최근 30일 제목 기반 중복 감지
- [ ] 아이디어 상태 관리 (Kanban)
- [ ] 14일 방치 감지
- [ ] 세션 로그 자동 저장

---

## 프롬프트

- [ ] 아이디어 생성 프롬프트 작성 및 테스트
- [ ] Deep Report 프롬프트 작성 및 테스트
- [ ] 평가 프롬프트 작성 및 테스트 (few-shot 포함)

---

## 데이터

- [ ] 고정 키워드 ==90+== Firestore 적재
- [ ] Firestore 인덱스 설정

---

## Done 기준

> [!important]
> 아래 4가지 조건이 모두 충족되어야 V1 완료로 판단한다.

- 발산 세션이 저장까지 끊기지 않고 ==5회 연속== 수행된다.
- Deep Report와 평가가 같은 아이디어에 대해 최소 3회 이상 완료된다.
- 중복 경고, 저장 실패, 상태 전이 규칙이 문서와 실제 운영에서 충돌하지 않는다.
- 운영 메모에 다음 수정 우선순위를 남길 수 있을 정도로 사용 패턴이 관찰된다.

---

## Related

- [[V2-Enhancement]] — V1 이후 확장 계획
- `plans/2026-03-16-v1-mvp-implementation.md` — V1 Phase별 상세 구현 계획 (6 Phase, 25 Tasks)

## See Also

- [[Roadmap]] — 전체 프로젝트 로드맵 (01-Core)
- [[Success-Metrics]] — V1 Done 기준과 연결되는 KPI (05-Operations)
