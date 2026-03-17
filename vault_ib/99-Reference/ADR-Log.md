---
title: ADR Log
tags:
  - reference
  - adr
---

# ADR Log (Architecture Decision Records)

> 프로젝트의 주요 기술 결정사항을 기록하는 ADR 로그. 모든 결정은 번복 전까지 유효하다.

---

## ADR-001: LLM을 OpenAI API로 결정

- **날짜:** 2026-03-16
- **결정:** Anthropic API 대신 ==OpenAI API== 사용
- **모델:** o4-mini (키워드/아이디어 생성), GPT-4o (보고서/평가)
- **근거:** 사용자 선호

---

## ADR-002: 저장소를 Firebase Firestore로 결정

- **날짜:** 2026-03-16
- **결정:** Notion DB 대신 ==Firebase Firestore== 사용
- **근거:** 무료 티어 충분, Vercel과 호환성 좋음, 자체 뷰 페이지 구현에 적합

---

## ADR-003: 배포를 Vercel로 결정

- **날짜:** 2026-03-16
- **결정:** ==Vercel== 배포
- **근거:** Next.js 기본 플랫폼, 무료 티어 개인 프로젝트 충분

---

## ADR-004: UI를 Tailwind + shadcn/ui로 결정

- **날짜:** 2026-03-16
- **결정:** ==Tailwind CSS + shadcn/ui==
- **근거:** 커스터마이즈 자유롭고 비용 없음

---

## ADR-005: Backend/Frontend 같은 프로젝트 내 폴더 분리

- **날짜:** 2026-03-16
- **결정:** Next.js App Router의 API Routes(백엔드) + Pages(프론트엔드)를 ==폴더로 분리==
- **근거:** 별도 서버 불필요, Vercel 하나로 배포 가능

---

## Related

- [[API-Endpoints]] — ADR 결정사항이 반영된 API 설계
- [[Keyword-Pool]] — 키워드 데이터 구조 참조

## See Also

- [[Tech-Stack]] — 기술 스택 전체 정의 (01-Core)
- [[Backend-API]] — 백엔드 아키텍처 상세 (02-Architecture)
