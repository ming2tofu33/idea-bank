---
title: API Endpoints
tags:
  - reference
  - api
status: Draft
---

# API Endpoints

> Idea Bank의 Next.js API Routes 엔드포인트 목록과 요청/응답 명세를 정리하는 문서.

---

## TODO

- [ ] 엔드포인트 목록
- [ ] 요청/응답 예시

> [!note]
> V1 MVP 개발이 시작되면 각 엔드포인트의 상세 명세를 이 문서에 추가한다.

---

## 예정 엔드포인트 (V1)

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/generate` | 아이디어 생성 |
| GET/POST | `/api/ideas` | 아이디어 CRUD |
| PATCH | `/api/ideas/[id]` | 상태 변경, 북마크 |
| POST | `/api/report` | Deep Report 생성 |
| POST | `/api/evaluate` | 평가 실행 |
| GET/POST/DELETE | `/api/keywords` | 키워드 CRUD |

---

## Related

- [[ADR-Log]] — API 설계에 영향을 준 기술 결정사항
- [[Keyword-Pool]] — 키워드 CRUD 엔드포인트의 데이터 소스

## See Also

- [[Backend-API]] — 백엔드 아키텍처 상세 (02-Architecture)
- [[Database-Schema]] — Firestore 데이터 구조 (02-Architecture)
