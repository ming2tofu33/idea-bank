# V1 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 키워드 선택 → 아이디어 생성 → 북마크 → Deep Report → 평가 → 축적 루프를 웹앱으로 구현

**Architecture:** Next.js App Router에서 프론트엔드(Pages)와 백엔드(API Routes)를 폴더로 분리. Firebase Firestore에 5개 컬렉션 저장. OpenAI API(o4-mini/GPT-4o) 호출은 서버 사이드에서만 수행.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Firebase Firestore, OpenAI API, Vercel

**Vault 참조:** `vault_ib/` 전체 — 특히 `02-Architecture/`, `03-Features/`, `04-AI-System/`

---

## Phase 개요

| Phase | 이름 | 목표 | 예상 기간 |
|---|---|---|---|
| **1** | Foundation | 프로젝트 초기화, 인프라 연결, 공유 로직 | 1~2일 |
| **2** | Data Layer | Firestore 스키마 구현, 키워드 시딩, CRUD API | 1~2일 |
| **3** | AI Integration | OpenAI 연동, 프롬프트 구현, 생성/평가/보고서 API | 2~3일 |
| **4** | Frontend Core | 레이아웃, 발산 페이지, 목록, 상세, 키워드 관리 | 3~4일 |
| **5** | Features & Polish | Serendipity, 방치 감지, 세션 로그, 대시보드 | 2~3일 |
| **6** | Deploy & Verify | Vercel 배포, E2E 검증, Done 기준 확인 | 1일 |

---

## Phase 1: Foundation

> 프로젝트 뼈대를 세우고 Firebase/OpenAI 연결을 확인한다.

### Task 1.1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

**Steps:**
1. `npx create-next-app@latest idea-bank --typescript --tailwind --app --src-dir`
2. shadcn/ui 초기화: `npx shadcn@latest init`
3. 기본 레이아웃에 "Idea Bank" 타이틀 표시 확인
4. `npm run dev`로 localhost 정상 확인
5. Commit: `feat: initialize Next.js project with Tailwind and shadcn/ui`

---

### Task 1.2: Firebase 연결

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `.env.local`
- Create: `.env.example`

**Steps:**
1. Firebase 콘솔에서 프로젝트 생성, Firestore 활성화
2. 서비스 계정 키 발급
3. `.env.local`에 `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` 설정
4. `firebase-admin` 패키지 설치
5. `src/lib/firebase.ts`에 Admin SDK 초기화 코드 작성
6. 테스트: API Route에서 Firestore 읽기/쓰기 확인
7. Commit: `feat: add Firebase Admin SDK connection`

---

### Task 1.3: OpenAI 클라이언트 설정

**Files:**
- Create: `src/lib/openai.ts`
- Modify: `.env.local` — `OPENAI_API_KEY` 추가

**Steps:**
1. `openai` 패키지 설치
2. `src/lib/openai.ts`에 클라이언트 초기화
3. 테스트: 간단한 API Route에서 o4-mini 호출 확인
4. Commit: `feat: add OpenAI client setup`

---

### Task 1.4: 공유 타입 정의

**Files:**
- Create: `src/types/idea.ts`
- Create: `src/types/evaluation.ts`
- Create: `src/types/keyword.ts`
- Create: `src/types/session.ts`
- Create: `src/types/ai-run.ts`

**Steps:**
1. `vault_ib/02-Architecture/Database-Schema.md` 기반으로 TypeScript 타입 정의
2. ideas, evaluations, sessions, keywords, ai_runs 각 컬렉션의 타입
3. API 요청/응답 타입 (GenerateRequest, GenerateResponse 등)
4. Commit: `feat: add shared TypeScript types`

---

## Phase 2: Data Layer

> Firestore CRUD와 키워드 초기 데이터를 구현한다.

### Task 2.1: 키워드 시딩 스크립트

**Files:**
- Create: `scripts/seed-keywords.ts`
- Reference: `vault_ib/99-Reference/Keyword-Pool.md`

**Steps:**
1. 96개 고정 키워드를 JSON 배열로 정리
2. Firestore `keywords` 컬렉션에 일괄 삽입하는 스크립트 작성
3. 각 키워드에 `source: "fixed"`, `used_count: 0`, `added_at: now` 설정
4. 스크립트 실행하여 Firestore에 96개 문서 생성 확인
5. Commit: `feat: add keyword seeding script with 96 fixed keywords`

---

### Task 2.2: Keywords API

**Files:**
- Create: `src/app/api/keywords/route.ts` — GET(목록), POST(추가)
- Create: `src/app/api/keywords/[id]/route.ts` — DELETE(삭제)

**Steps:**
1. GET `/api/keywords` — 카테고리별 키워드 목록 반환
2. POST `/api/keywords` — 커스텀 키워드 추가 (`source: "custom"`)
3. DELETE `/api/keywords/[id]` — 커스텀 키워드만 삭제 가능 (fixed는 삭제 불가)
4. 각 엔드포인트 수동 테스트 (curl 또는 브라우저)
5. Commit: `feat: add keywords CRUD API routes`

---

### Task 2.3: Ideas API (기본 CRUD)

**Files:**
- Create: `src/app/api/ideas/route.ts` — GET(목록), POST(저장)
- Create: `src/app/api/ideas/[id]/route.ts` — GET(상세), PATCH(상태변경)

**Steps:**
1. GET `/api/ideas` — 필터(status, bookmarked), 정렬(created_at desc), 페이지네이션
2. POST `/api/ideas` — 아이디어 저장 (생성 API에서 내부 호출)
3. GET `/api/ideas/[id]` — 상세 조회 (evaluation, deep_report 포함)
4. PATCH `/api/ideas/[id]` — status 변경, bookmarked 토글
5. Commit: `feat: add ideas CRUD API routes`

---

### Task 2.4: 에러 처리 유틸리티

**Files:**
- Create: `src/lib/errors.ts`

**Steps:**
1. 통일된 에러 응답 포맷 구현: `{ error: true, code, message, details }`
2. 에러 코드 enum: `GENERATION_FAILED`, `SAVE_FAILED`, `VALIDATION_FAILED`, `NOT_FOUND`
3. Firestore 저장 재시도 래퍼 (최대 3회)
4. Commit: `feat: add unified error handling utilities`

---

## Phase 3: AI Integration

> OpenAI 프롬프트를 구현하고 생성/평가/보고서 API를 완성한다.

### Task 3.1: 프롬프트 템플릿 구현

**Files:**
- Create: `src/lib/prompts/generation.ts`
- Create: `src/lib/prompts/evaluation.ts`
- Create: `src/lib/prompts/report.ts`
- Reference: `vault_ib/04-AI-System/Prompt-*.md`

**Steps:**
1. 각 파일에 시스템 프롬프트 + 사용자 프롬프트 빌더 함수 구현
2. `buildGenerationPrompt(keywords, mode, existingTitles)` → 시스템/사용자 메시지
3. `buildEvaluationPrompt(ideaPRD)` → 시스템(few-shot 포함)/사용자 메시지
4. `buildReportPrompt(idea)` → 시스템/사용자 메시지
5. Commit: `feat: add prompt templates for generation, evaluation, report`

---

### Task 3.2: JSON 응답 검증

**Files:**
- Create: `src/lib/validators/idea-response.ts`
- Create: `src/lib/validators/evaluation-response.ts`
- Create: `src/lib/validators/report-response.ts`
- Reference: `vault_ib/04-AI-System/Response-Contracts.md`

**Steps:**
1. 각 응답 타입의 JSON 스키마 검증 함수 구현
2. 검증 실패 시 1회 same-input 재시도 로직
3. 재시도 후에도 실패 시 `validation_status: "failed"` 반환
4. Commit: `feat: add JSON response validators`

---

### Task 3.3: Generate API (아이디어 생성)

**Files:**
- Create: `src/app/api/generate/route.ts`

**Steps:**
1. POST `/api/generate` 구현
2. 요청에서 keywords, mode 추출
3. 최근 30일 아이디어 제목을 Firestore에서 조회
4. 프롬프트 빌드 → o4-mini 호출 → JSON 검증
5. 검증 통과 시 ideas 컬렉션에 10개 아이디어 일괄 저장
6. ai_runs 로그 기록 (토큰, 지연시간, 상태)
7. 중복 감지: 기존 제목과 비교하여 duplicate_warning 설정
8. Commit: `feat: add idea generation API with OpenAI o4-mini`

---

### Task 3.4: Report API (Deep Report)

**Files:**
- Create: `src/app/api/report/route.ts`

**Steps:**
1. POST `/api/report` 구현
2. idea_id로 아이디어 조회 → 프롬프트 빌드 → GPT-4o 호출
3. JSON 검증 → Firestore 저장 (ideas 문서에 deep_report_id 연결)
4. 아이디어 상태를 `reviewing`으로 전환
5. ai_runs 로그 기록
6. Commit: `feat: add deep report generation API with GPT-4o`

---

### Task 3.5: Evaluate API (비즈니스 평가)

**Files:**
- Create: `src/app/api/evaluate/route.ts`

**Steps:**
1. POST `/api/evaluate` 구현
2. idea_id로 아이디어 + Deep Report 조회 → 프롬프트 빌드 → GPT-4o 호출
3. JSON 검증 → evaluations 컬렉션 저장 → ideas에 evaluation_id, total_score 연결
4. total_score 기반 상태 전이 (80+: 실행 후보 태그, 60 미만: on_hold)
5. ai_runs 로그 기록
6. Commit: `feat: add business evaluation API with GPT-4o`

---

## Phase 4: Frontend Core

> 사용자가 실제로 사용하는 UI 페이지들을 구현한다.

### Task 4.1: 공통 레이아웃 + 사이드바

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/sidebar.tsx`

**Steps:**
1. shadcn/ui의 Sidebar 컴포넌트 활용
2. 네비게이션: 대시보드, 발산 세션, 아이디어, 키워드 관리
3. 반응형 레이아웃 (모바일에서 접기)
4. Commit: `feat: add app layout with sidebar navigation`

---

### Task 4.2: /generate 발산 세션 페이지

**Files:**
- Create: `src/app/generate/page.tsx`
- Create: `src/components/keyword-picker.tsx`
- Create: `src/components/mode-selector.tsx`
- Create: `src/components/idea-card.tsx`

**Steps:**
1. KeywordPicker: 카테고리별 탭 + 키워드 토글 선택
2. ModeSelector: Full Match / Forced Pairing / Serendipity 라디오
3. "생성" 버튼 → POST /api/generate 호출 → 로딩 상태
4. 결과 10개 IdeaCard로 표시 (제목 + 요약 + 북마크 버튼)
5. 북마크 토글 → PATCH /api/ideas/[id]
6. Commit: `feat: add generate page with keyword picker and idea cards`

---

### Task 4.3: /ideas 목록 페이지

**Files:**
- Create: `src/app/ideas/page.tsx`
- Create: `src/components/idea-kanban.tsx`
- Create: `src/components/idea-list.tsx`

**Steps:**
1. Kanban 뷰: new / interested / reviewing / executing / on_hold / archived 컬럼
2. 리스트 뷰: 테이블 형태, 정렬/필터
3. 뷰 전환 토글 (Kanban / List)
4. 상태 변경: 드래그 앤 드롭 또는 드롭다운
5. 필터: status, bookmarked, 키워드
6. Commit: `feat: add ideas list page with kanban and list views`

---

### Task 4.4: /ideas/[id] 상세 페이지

**Files:**
- Create: `src/app/ideas/[id]/page.tsx`
- Create: `src/components/deep-report-view.tsx`
- Create: `src/components/evaluation-view.tsx`

**Steps:**
1. 아이디어 기본 정보 표시 (제목, 요약, 키워드, 상태)
2. Deep Report 생성 버튼 → POST /api/report → 결과 렌더링
3. 평가 실행 버튼 → POST /api/evaluate → 4개 항목 점수 + 3중 구조 표시
4. Next Step 제안 표시
5. 상태 변경 드롭다운
6. Commit: `feat: add idea detail page with report and evaluation`

---

### Task 4.5: /keywords 키워드 관리 페이지

**Files:**
- Create: `src/app/keywords/page.tsx`
- Create: `src/components/keyword-table.tsx`

**Steps:**
1. 카테고리별 키워드 테이블 (키워드명, source, used_count, last_used)
2. 커스텀 키워드 추가 폼
3. 커스텀 키워드 삭제 버튼 (fixed는 삭제 불가)
4. 사용 횟수 정렬
5. Commit: `feat: add keywords management page`

---

## Phase 5: Features & Polish

> 추천 조합, 방치 감지, 세션 로그, 대시보드를 구현한다.

### Task 5.1: Serendipity 추천 조합

**Files:**
- Create: `src/lib/serendipity.ts`
- Modify: `src/app/generate/page.tsx` — 추천 조합 표시

**Steps:**
1. 추천 점수 계산: `novelty(0.5) + diversity(0.3) + recency_penalty(0.2)`
2. keywords, sessions, ideas 컬렉션에서 데이터 조회
3. 초기 상태 처리: 5회 미만 세션이면 랜덤 추천
4. /generate 페이지 상단에 추천 조합 3세트 카드 표시
5. "수락" 버튼 → 키워드 자동 선택
6. Commit: `feat: add serendipity recommendation engine`

---

### Task 5.2: 14일 방치 → 자동 아카이브

**Files:**
- Create: `src/lib/stale-checker.ts`
- Modify: `src/app/layout.tsx` 또는 대시보드 — 접속 시 트리거

**Steps:**
1. `checkStaleIdeas()`: last_reviewed가 14일 이전이고 status가 executing/archived가 아닌 아이디어 조회
2. 해당 아이디어를 `archived`로 전환, `stale_flag: true` 설정
3. 앱 접속 시 (대시보드 로드 시) 자동 실행
4. Commit: `feat: add auto-archive for 14-day stale ideas`

---

### Task 5.3: 세션 로그 자동 저장

**Files:**
- Modify: `src/app/api/generate/route.ts` — 세션 로그 저장 추가

**Steps:**
1. 아이디어 생성 완료 후 sessions 컬렉션에 로그 저장
2. 북마크 완료 시 ideas_bookmarked 업데이트
3. session_type: "diverge", 키워드, 모드, 생성 수, 소요 시간 기록
4. Commit: `feat: add automatic session logging`

---

### Task 5.4: / 대시보드 페이지

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/serendipity-card.tsx`

**Steps:**
1. 오늘의 추천 조합 3세트 (SerendipityCard)
2. 최근 북마크 아이디어 5개
3. 최근 세션 활동 요약
4. 방치 아이디어 알림 (archived된 항목 수)
5. 월간 API 비용 요약 (ai_runs 집계)
6. Commit: `feat: add dashboard with recommendations and activity summary`

---

## Phase 6: Deploy & Verify

> 배포하고 Done 기준을 검증한다.

### Task 6.1: Vercel 배포

**Steps:**
1. GitHub repo 생성 및 push
2. Vercel에 프로젝트 연결
3. 환경 변수 설정 (OPENAI_API_KEY, FIREBASE_*)
4. 첫 배포 및 프로덕션 URL 확인
5. Commit: `chore: configure Vercel deployment`

---

### Task 6.2: Firestore 인덱스 설정

**Steps:**
1. `vault_ib/02-Architecture/Database-Schema.md` 인덱스 섹션 참조
2. Firebase 콘솔에서 복합 인덱스 5개 생성
3. 인덱스 빌드 완료 확인
4. Commit: `chore: configure Firestore composite indexes`

---

### Task 6.3: Done 기준 검증

**Reference:** `vault_ib/06-Implementation/V1-MVP-Plan.md` Done 기준

**Steps:**
1. 발산 세션 5회 연속 실행 → 저장까지 끊김 없이 성공하는지 확인
2. 같은 아이디어에 Deep Report + 평가를 3회 이상 실행
3. 중복 경고, 저장 실패, 상태 전이 규칙이 문서와 일치하는지 확인
4. 운영 메모 작성 가능할 정도로 패턴 관찰

---

## 의존성 그래프

```
Phase 1 (Foundation)
  ├── 1.1 Next.js 초기화
  ├── 1.2 Firebase 연결 ← 1.1
  ├── 1.3 OpenAI 설정 ← 1.1
  └── 1.4 타입 정의 ← 1.1

Phase 2 (Data Layer) ← Phase 1 전체
  ├── 2.1 키워드 시딩 ← 1.2
  ├── 2.2 Keywords API ← 1.2, 1.4
  ├── 2.3 Ideas API ← 1.2, 1.4
  └── 2.4 에러 처리 ← 1.4

Phase 3 (AI Integration) ← Phase 2 전체
  ├── 3.1 프롬프트 템플릿
  ├── 3.2 JSON 검증
  ├── 3.3 Generate API ← 2.3, 3.1, 3.2
  ├── 3.4 Report API ← 2.3, 3.1, 3.2
  └── 3.5 Evaluate API ← 3.4, 3.1, 3.2

Phase 4 (Frontend) ← Phase 3 전체
  ├── 4.1 레이아웃 + 사이드바
  ├── 4.2 /generate ← 4.1
  ├── 4.3 /ideas ← 4.1
  ├── 4.4 /ideas/[id] ← 4.3
  └── 4.5 /keywords ← 4.1

Phase 5 (Features) ← Phase 4 전체
  ├── 5.1 Serendipity ← 4.2
  ├── 5.2 방치 감지
  ├── 5.3 세션 로그 ← 4.2
  └── 5.4 대시보드 ← 5.1, 5.2

Phase 6 (Deploy) ← Phase 5 전체
  ├── 6.1 Vercel 배포
  ├── 6.2 인덱스 설정
  └── 6.3 Done 검증 ← 6.1, 6.2
```
