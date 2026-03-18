# Phase 6: Deploy & Verify Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub에 push하고 Vercel에 배포하여 프로덕션 URL을 확보한 뒤, V1 Done 기준 4가지를 검증한다.

**Architecture:** GitHub repo 생성 → Vercel 연결 → 환경 변수 설정 → 배포 → E2E 검증. Firestore 인덱스는 앱 사용 중 필요 시 Firebase 콘솔에서 생성 (에러 로그에 자동 생성 링크 제공됨).

**Tech Stack:** GitHub, Vercel, Firebase Console

---

## File Structure

```
.env.example                (MODIFY — Tavily 키 추가)
.gitignore                  (VERIFY — .env.local 포함 확인)
next.config.ts              (VERIFY — 배포 설정 확인)
vault_ib/06-Implementation/
  V1-MVP-Plan.md            (MODIFY — Done 기준 체크)
```

---

## Chunk 1: 배포 준비 + GitHub + Vercel

### Task 6.1: 배포 준비 (환경 정리)

**Files:**
- Modify: `.env.example`
- Verify: `.gitignore`

- [ ] **Step 1: .env.example에 Tavily 키 추가**

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# OpenAI API
OPENAI_API_KEY=

# Tavily Search API
TAVILY_API_KEY=
```

- [ ] **Step 2: .gitignore에 민감 파일 확인**

`.env.local`이 이미 gitignore에 포함되어 있는지 확인. 없으면 추가.

- [ ] **Step 3: 빌드 최종 확인**

Run: `npx next build`
Expected: 15개 라우트 모두 정상 빌드

- [ ] **Step 4: 커밋**

```bash
git add .env.example
git commit -m "chore: add TAVILY_API_KEY to env example"
```

---

### Task 6.2: GitHub 저장소 생성 및 Push

- [ ] **Step 1: GitHub repo 생성**

```bash
gh repo create idea-bank --private --source=. --push
```

또는 이미 remote가 있으면:
```bash
git remote add origin https://github.com/USERNAME/idea-bank.git
git push -u origin main
```

- [ ] **Step 2: Push 확인**

```bash
gh repo view --web
```

---

### Task 6.3: Vercel 배포

- [ ] **Step 1: Vercel CLI 설치 (없으면)**

```bash
npm i -g vercel
```

- [ ] **Step 2: Vercel 프로젝트 연결**

```bash
vercel link
```

프로젝트 이름: `idea-bank`

- [ ] **Step 3: 환경 변수 설정**

Vercel 대시보드 → Settings → Environment Variables에 추가:
```
FIREBASE_PROJECT_ID=<값>
FIREBASE_CLIENT_EMAIL=<값>
FIREBASE_PRIVATE_KEY=<값 — 줄바꿈 포함 원본>
OPENAI_API_KEY=<값>
TAVILY_API_KEY=<값>
```

또는 CLI로:
```bash
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
vercel env add OPENAI_API_KEY
vercel env add TAVILY_API_KEY
```

- [ ] **Step 4: 배포**

```bash
vercel --prod
```

- [ ] **Step 5: 프로덕션 URL 확인**

배포 완료 후 URL 접속 → 대시보드 정상 렌더링 확인.
`/api/health` 엔드포인트로 Firebase + OpenAI 연결 확인.

---

## Chunk 2: Done 기준 검증

### Task 6.4: V1 Done 기준 검증

**Reference:** `vault_ib/06-Implementation/V1-MVP-Plan.md` Done 기준

4가지 조건 모두 충족해야 V1 완료:

- [ ] **검증 1: 발산 세션 5회 연속 수행**

프로덕션 URL에서:
1. `/generate` → 키워드 3개 선택 → Mix Ideas → 10개 생성 확인
2. 5회 반복 (매번 다른 키워드 조합)
3. 모든 세션에서 저장까지 끊김 없이 성공하는지 확인
4. Firebase Console → sessions 컬렉션에 5개 문서 생성 확인

Expected: 5회 모두 10개 아이디어 + 세션 로그 저장 성공

- [ ] **검증 2: Deep Report + 평가 3회 이상**

1. `/ideas` → 아이디어 1개 선택 → 상세 페이지
2. "Report 생성" → Deep Report 9섹션 렌더링 확인 (Tavily 실제 경쟁사 데이터 포함)
3. "평가 실행" → 4차원 점수 + 3중 근거 렌더링 확인
4. 다른 아이디어 2개에 대해 반복 (총 3회)
5. Firebase Console → deep_reports 3개 + evaluations 3개 확인

Expected: 3회 모두 보고서+평가 성공, 실제 경쟁사 URL 포함

- [ ] **검증 3: 규칙 일치 확인**

1. 중복 경고: 같은 키워드로 재생성 시 이전 제목과 유사한 아이디어에 `duplicate_warning: true` 확인
2. 상태 전이: 북마크 → reviewing, 평가 60점 미만 → on_hold 확인
3. 14일 방치: (로컬에서 last_reviewed를 15일 전으로 수동 변경 후 대시보드 접속 → archived 전환 확인)

- [ ] **검증 4: 운영 패턴 관찰**

대시보드에서:
1. 통계 카드 5개 값 정확한지 확인 (아이디어 수, 북마크, 검토 중, 방치, 비용)
2. 월간 비용이 ai_runs 토큰 합산과 일치하는지 확인
3. 세렌디피티 추천 조합이 정상 표시되는지 확인

---

### Task 6.5: Done 기준 결과 기록

- [ ] **Step 1: V1-MVP-Plan.md 체크리스트 업데이트**

검증 통과한 항목 체크 표시.

- [ ] **Step 2: 최종 커밋**

```bash
git add vault_ib/06-Implementation/V1-MVP-Plan.md
git commit -m "docs: mark V1 MVP done criteria as verified"
git push
```

---

## Verification Summary

| Done 기준 | 검증 방법 | 통과 조건 |
|-----------|----------|----------|
| 발산 5회 연속 | 프로덕션에서 실행 | 50개 아이디어 + 5개 세션 로그 |
| Report+평가 3회 | 프로덕션에서 실행 | 3개 보고서 + 3개 평가 |
| 규칙 일치 | 중복경고 + 상태전이 + 방치 | 문서와 실제 동작 일치 |
| 운영 패턴 | 대시보드 통계 확인 | 비용/세션/방치 수치 정확 |
