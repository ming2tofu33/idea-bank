---
title: Deployment
tags:
  - operations
  - deployment
  - vercel
status: Draft
---

# Deployment

> Vercel 기반 배포 환경, 환경 변수 설정, 배포 파이프라인을 정의한다.

---

## 배포 환경

| 항목 | 결정 |
|---|---|
| 플랫폼 | ==Vercel== |
| 플랜 | Hobby (무료) |
| 프레임워크 | Next.js (App Router) |
| 빌드 | Vercel 자동 빌드 |

---

## 환경 변수

`.env.local` (로컬) 및 Vercel Environment Variables에 설정:

| 변수 | 용도 |
|---|---|
| `OPENAI_API_KEY` | OpenAI API 인증 |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase 서비스 계정 이메일 |
| `FIREBASE_PRIVATE_KEY` | Firebase 서비스 계정 키 |

> [!warning]
> API 키는 서버 사이드(API Routes)에서만 사용. ==클라이언트에 절대 노출하지 않는다.==

---

## 배포 파이프라인

```text
git push to main
  → Vercel 자동 감지
  → 빌드 (next build)
  → 배포 (Vercel Edge Network)
  → 프리뷰 URL 생성 (PR 시)
```

> [!tip]
> PR을 생성하면 자동으로 프리뷰 배포가 생성되어 변경사항을 미리 확인할 수 있다.

---

## TODO

- [ ] Vercel 프로젝트 생성 및 연결
- [ ] Firebase 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 첫 배포 테스트

---

## Related

- [[Cost-Management]] — Vercel 무료 티어 비용 구조
- [[Session-Flow]] — 배포된 앱의 운영 흐름

## See Also

- [[Roadmap]] — 배포 관련 마일스톤 (01-Core)
- [[Idea-Lifecycle]] — 배포된 환경에서의 아이디어 흐름 (03-Features)
