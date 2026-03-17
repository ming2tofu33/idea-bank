---
title: Tech Stack
tags:
  - core
  - stack
---

# Tech Stack

> Next.js + Firebase Firestore + OpenAI API + Vercel

---

## 확정 스택

| 레이어 | 기술 | 역할 |
|---|---|---|
| 프레임워크 | **Next.js** (App Router) | 페이지 렌더링 + API Routes |
| UI | **Tailwind CSS + shadcn/ui** | 스타일링 + 컴포넌트 라이브러리 |
| DB | **Firebase Firestore** | 아이디어, 평가, 세션, 키워드 저장 |
| LLM | **OpenAI API** | 아이디어 생성, 보고서, 평가 |
| 배포 | **Vercel** | 프론트 + API 서버리스 배포 |

---

## LLM 모델 배분

| 용도 | 모델 | 이유 |
|---|---|---|
| 키워드/아이디어 생성 | **o4-mini** | 빠르고 가성비 좋음 |
| Deep Report (PRD) | **GPT-4o** | 복잡한 분석과 구조화 |
| 비즈니스 평가 | **GPT-4o** | 다각도 평가와 반론 생성 |

---

## 주요 결정 근거

> [!note] Firebase Spark (무료) 플랜
> 1GB 저장, 일 50K 읽기 / 20K 쓰기. 개인용 일 1회 세션 규모에서 충분.
> Firebase Functions 없이 Vercel API Routes로 서버 로직 처리.

### Next.js + Vercel
- App Router의 API Routes로 별도 백엔드 서버 없이 운영
- 같은 프로젝트 내에서 프론트엔드/백엔드 폴더 분리

### OpenAI API
- o4-mini로 생성 비용 최소화, GPT-4o로 분석 품질 확보
- 용도별 모델 분리로 비용과 품질 균형

---

## 이전 스택과의 변경

| 항목 | 이전 (문서 초안) | 현재 (확정) |
|---|---|---|
| V1 플랫폼 | Claude Project (대화형) | Next.js 웹앱 |
| LLM | Anthropic API | OpenAI API |
| 저장소 | Notion DB | Firebase Firestore |
| 자동화 | n8n / Make | Vercel API Routes (내장) |

> [!tip] ADR 참조
> 상세 결정 기록은 [[ADR-Log]] 참조.

---

## Related

- [[Project-Vision]] — 프로젝트 비전
- [[Roadmap]] — V1/V2 로드맵

## See Also

- [[System-Architecture]] — 전체 시스템 구성도 (02-Architecture)
