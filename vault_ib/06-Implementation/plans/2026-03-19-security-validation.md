# Security Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Idea Bank의 모든 API 엔드포인트 보안 취약점을 수정하고, 비용 공격(AI API 남용) 방어와 입력 검증을 강화한다.

**Architecture:** 서버사이드 미들웨어 패턴을 유지하면서 각 API Route에 최소한의 보안 레이어를 추가. 별도 rate limiting 라이브러리 없이 Firestore 기반 간단한 레이트 리미터 구현.

**Tech Stack:** Next.js 15 App Router, Firebase Admin SDK, NextAuth v5

---

## 보안 감사 결과 요약

### 🔴 Critical (즉시 수정)

| ID | 이슈 | 파일 | 위험 |
|----|------|------|------|
| C1 | **IDOR**: `/api/report`가 `idea.user_id` 소유권 미확인 | `report/route.ts:23` | 타인 아이디어로 GPT-4o 호출 ($비용 발생) |
| C2 | **IDOR**: `/api/evaluate`가 `idea.user_id` 소유권 미확인 | `evaluate/route.ts:22` | 타인 아이디어로 GPT-4o 호출 ($비용 발생) |
| C3 | **공개 `/api/health`가 OpenAI 호출** | `health/route.ts`, `middleware.ts` | 인증 없이 반복 호출 → API 비용 무한 증가 |

### 🟠 High (이번 스프린트 내 수정)

| ID | 이슈 | 파일 | 위험 |
|----|------|------|------|
| H1 | **Rate limiting 없음**: AI 엔드포인트 무제한 호출 | `generate/`, `report/`, `evaluate/` | 인증된 사용자도 무한 호출 가능 |
| H2 | **Firestore security rules 없음** | 루트 디렉토리 | 클라이언트 SDK 추가 시 전체 DB 노출 |

### 🟡 Medium (순차 수정)

| ID | 이슈 | 파일 | 위험 |
|----|------|------|------|
| M1 | **입력 크기 제한 없음**: keywords 배열/문자열 길이 무제한 | `generate/route.ts`, `keywords/route.ts` | 거대 프롬프트 주입으로 토큰 낭비 |
| M2 | **limit 파라미터 무제한**: parseInt 결과 상한 없음 | `ideas/route.ts:17` | 대량 Firestore read 유발 |
| M3 | **PATCH body 필드 미필터링**: body 스프레드로 임의 필드 주입 가능 | `ideas/[id]/route.ts:66` | user_id 등 민감 필드 덮어쓰기 |

---

## Chunk 1: Critical 취약점 수정 (C1, C2, C3)

### Task 1: IDOR 수정 — `/api/report` 소유권 체크

**Files:**
- Modify: `src/app/api/report/route.ts:23-27`

현재 코드 (취약):
```ts
const ideaDoc = await collections.ideas.doc(body.idea_id).get();
if (!ideaDoc.exists) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
const idea = ideaDoc.data()!;
```

- [ ] **Step 1: `report/route.ts` 소유권 체크 추가**

`src/app/api/report/route.ts`의 idea 존재 확인 직후에 아래 코드 추가:

```ts
// 1. Fetch idea
const ideaDoc = await collections.ideas.doc(body.idea_id).get();
if (!ideaDoc.exists) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
const idea = ideaDoc.data()!;

// 소유권 체크 — 다른 유저 아이디어로 AI 호출 방지
if (idea.user_id !== user.userId) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
```

> 404를 반환하는 이유: 403이면 "아이디어가 존재하지만 권한 없음"을 알려줘서 정보 노출이 됨. 404로 아이디어 존재 여부 자체를 숨김.

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```
Expected: `✓ OK`

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/report/route.ts
git commit -m "fix: add ownership check in /api/report to prevent IDOR"
```

---

### Task 2: IDOR 수정 — `/api/evaluate` 소유권 체크

**Files:**
- Modify: `src/app/api/evaluate/route.ts:22-26`

현재 코드 (취약):
```ts
const ideaDoc = await collections.ideas.doc(body.idea_id).get();
if (!ideaDoc.exists) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
const idea = ideaDoc.data()!;
```

- [ ] **Step 1: `evaluate/route.ts` 소유권 체크 추가**

```ts
// 1. Fetch idea
const ideaDoc = await collections.ideas.doc(body.idea_id).get();
if (!ideaDoc.exists) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
const idea = ideaDoc.data()!;

// 소유권 체크
if (idea.user_id !== user.userId) {
  return errorResponse("NOT_FOUND", "Idea not found", 404);
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/evaluate/route.ts
git commit -m "fix: add ownership check in /api/evaluate to prevent IDOR"
```

---

### Task 3: `/api/health` 보호 — OpenAI 호출 제거

**Files:**
- Modify: `src/app/api/health/route.ts`

현재 `/api/health`는 미들웨어에서 인증 제외(`api/health` 패턴으로 matcher에서 빠짐)되어 있지만 OpenAI를 실제로 호출함 → 비용 공격 가능.

전략: OpenAI 헬스체크 제거, Firebase만 확인. OpenAI는 "키 설정됨 여부"만 체크.

- [ ] **Step 1: `health/route.ts` OpenAI 실호출 제거**

`src/app/api/health/route.ts`를 아래로 교체:

```ts
import { NextResponse } from "next/server";
import { db } from "@/server/firebase";

// GET /api/health — Firebase 연결 확인만 (OpenAI 실호출 없음)
export async function GET() {
  const results: Record<string, unknown> = {};

  // Firebase test
  try {
    const testRef = db.collection("_health_check").doc("test");
    await testRef.set({ status: "ok", timestamp: new Date().toISOString() });
    const doc = await testRef.get();
    results.firebase = { status: "connected", data: doc.data() };
    await testRef.delete();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    results.firebase = { status: "error", message };
  }

  // OpenAI: 실호출 없이 키 설정 여부만 확인
  results.openai = {
    status: process.env.OPENAI_API_KEY ? "configured" : "missing",
  };

  const healthy =
    (results.firebase as Record<string, unknown>)?.status === "connected" &&
    (results.openai as Record<string, unknown>)?.status === "configured";

  return NextResponse.json(
    { healthy, services: results },
    { status: healthy ? 200 : 503 },
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/health/route.ts
git commit -m "fix: remove OpenAI live call from public /api/health to prevent cost attack"
```

---

## Chunk 2: Rate Limiting (H1)

AI 엔드포인트 3개(`/api/generate`, `/api/report`, `/api/evaluate`)에 유저별 호출 제한 적용.

**전략:** 별도 Redis/라이브러리 없이 Firestore의 `ai_runs` 컬렉션을 활용. 최근 1시간 내 유저별 호출 횟수 집계.

| 엔드포인트 | 한도 |
|-----------|------|
| `/api/generate` | 유저당 시간당 10회 |
| `/api/report` | 유저당 시간당 5회 |
| `/api/evaluate` | 유저당 시간당 5회 |

### Task 4: Rate limiter 헬퍼 생성

**Files:**
- Create: `src/server/rate-limiter.ts`

- [ ] **Step 1: `rate-limiter.ts` 생성**

```ts
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";

/**
 * Firestore ai_runs 기반 유저별 Rate Limiter.
 * @param userId  유저 식별자
 * @param runType run_type 값 (ai_runs 컬렉션 필드)
 * @param limit   허용 횟수 (1시간 기준)
 * @returns 제한 초과 시 429 NextResponse, 통과 시 null
 */
export async function checkRateLimit(
  userId: string,
  runType: "idea_generation" | "deep_report" | "evaluation",
  limit: number,
): Promise<Response | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const snapshot = await collections.aiRuns
    .where("user_id", "==", userId)
    .where("run_type", "==", runType)
    .where("created_at", ">=", oneHourAgo)
    .get();

  if (snapshot.size >= limit) {
    return errorResponse(
      "BAD_REQUEST",
      `Rate limit exceeded: max ${limit} ${runType} calls per hour`,
      429,
    );
  }

  return null;
}
```

> **참고:** `ai_runs` 컬렉션에 현재 `user_id` 필드가 없다. Task 5에서 추가한다.

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

---

### Task 5: `ai_runs`에 `user_id` 추가

Rate limiter가 유저별로 집계하려면 `ai_runs` 문서에 `user_id`가 있어야 한다.

**Files:**
- Modify: `src/types/ai-run.ts` — `AIRunCreateInput`에 `user_id` 필드 추가
- Modify: `src/app/api/generate/route.ts` — aiRunData에 user_id 추가
- Modify: `src/app/api/report/route.ts` — aiRunData에 user_id 추가
- Modify: `src/app/api/evaluate/route.ts` — aiRunData에 user_id 추가

- [ ] **Step 1: `AIRunCreateInput` 타입에 user_id 추가**

`src/types/ai-run.ts`에서 `AIRunCreateInput` 인터페이스에:
```ts
user_id: string;
```
추가.

- [ ] **Step 2: 각 API Route의 `aiRunData` 객체에 `user_id` 추가**

`generate/route.ts`, `report/route.ts`, `evaluate/route.ts` 각각의 `aiRunData` 객체 생성 부분:
```ts
const aiRunData: AIRunCreateInput = {
  user_id: user.userId,   // ← 추가
  run_type: "...",
  // ...
};
```

- [ ] **Step 3: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 4: 커밋**

```bash
git add src/types/ai-run.ts src/app/api/generate/route.ts src/app/api/report/route.ts src/app/api/evaluate/route.ts
git commit -m "feat: add user_id to ai_runs documents for rate limiting support"
```

---

### Task 6: Rate limiting 각 AI 엔드포인트에 적용

**Files:**
- Modify: `src/server/rate-limiter.ts` (Task 4에서 생성)
- Modify: `src/app/api/generate/route.ts`
- Modify: `src/app/api/report/route.ts`
- Modify: `src/app/api/evaluate/route.ts`

- [ ] **Step 1: `generate/route.ts`에 rate limit 적용**

`getAuthUser()` 확인 직후, body 파싱 전에 추가:
```ts
const user = await getAuthUser();
if (user instanceof Response) return user;

// Rate limit: 시간당 10회
const rateLimited = await checkRateLimit(user.userId, "idea_generation", 10);
if (rateLimited) return rateLimited;
```

- [ ] **Step 2: `report/route.ts`에 rate limit 적용**

```ts
const user = await getAuthUser();
if (user instanceof Response) return user;

// Rate limit: 시간당 5회
const rateLimited = await checkRateLimit(user.userId, "deep_report", 5);
if (rateLimited) return rateLimited;
```

- [ ] **Step 3: `evaluate/route.ts`에 rate limit 적용**

```ts
const user = await getAuthUser();
if (user instanceof Response) return user;

// Rate limit: 시간당 5회
const rateLimited = await checkRateLimit(user.userId, "evaluation", 5);
if (rateLimited) return rateLimited;
```

- [ ] **Step 4: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 5: 커밋**

```bash
git add src/server/rate-limiter.ts src/app/api/generate/route.ts src/app/api/report/route.ts src/app/api/evaluate/route.ts
git commit -m "feat: add per-user rate limiting to AI endpoints (10/5/5 per hour)"
```

---

## Chunk 3: Firestore Security Rules (H2)

Firebase Admin SDK는 Firestore security rules를 bypass하지만, 미래에 클라이언트 SDK 사용(실시간 업데이트 등)을 추가할 때를 대비해 규칙을 정의한다.

### Task 7: Firestore security rules 작성

**Files:**
- Create: `firestore.rules` (프로젝트 루트)

- [ ] **Step 1: `firestore.rules` 생성**

프로젝트 루트에 `firestore.rules` 파일 생성:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 기본: 모든 접근 거부 (화이트리스트 방식)
    match /{document=**} {
      allow read, write: if false;
    }

    // ideas: 본인 데이터만
    match /ideas/{ideaId} {
      allow read, write: if request.auth != null
        && request.auth.token.email == resource.data.user_id;
      allow create: if request.auth != null
        && request.auth.token.email == request.resource.data.user_id;
    }

    // keywords: fixed는 모두 읽기, custom은 본인만
    match /keywords/{keywordId} {
      allow read: if request.auth != null
        && (resource.data.source == "fixed"
            || request.auth.token.email == resource.data.user_id);
      allow write: if request.auth != null
        && request.auth.token.email == resource.data.user_id
        && resource.data.source == "custom";
      allow create: if request.auth != null
        && request.auth.token.email == request.resource.data.user_id
        && request.resource.data.source == "custom";
    }

    // deep_reports: 연결된 아이디어 소유자만 (서버에서만 접근)
    match /deep_reports/{reportId} {
      allow read, write: if false; // Admin SDK만 접근
    }

    // evaluations: Admin SDK만 접근
    match /evaluations/{evalId} {
      allow read, write: if false;
    }

    // ai_runs: Admin SDK만 접근
    match /ai_runs/{runId} {
      allow read, write: if false;
    }

    // sessions: Admin SDK만 접근
    match /sessions/{sessionId} {
      allow read, write: if false;
    }

    // _health_check: Admin SDK만 접근
    match /_health_check/{doc} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Firebase 프로젝트에 배포**

Firebase CLI가 설치된 경우:
```bash
firebase deploy --only firestore:rules
```

CLI 없으면: Firebase 콘솔 → Firestore → Rules 탭에 위 내용 붙여넣고 게시.

- [ ] **Step 3: 커밋**

```bash
git add firestore.rules
git commit -m "feat: add Firestore security rules (deny-by-default, whitelist approach)"
```

---

## Chunk 4: Input Validation Hardening (M1, M2, M3)

### Task 8: 입력 크기 제한 강화

**Files:**
- Modify: `src/app/api/generate/route.ts`
- Modify: `src/app/api/keywords/route.ts`
- Modify: `src/app/api/ideas/route.ts`

- [ ] **Step 1: `generate/route.ts` — keywords 배열 및 문자열 길이 제한**

기존 검증:
```ts
if (!body.keywords?.length || !body.mode) {
```

아래로 교체:
```ts
if (!body.keywords?.length || !body.mode) {
  return errorResponse("BAD_REQUEST", "keywords and mode are required", 400);
}
if (body.keywords.length > 20) {
  return errorResponse("BAD_REQUEST", "Too many keywords (max 20)", 400);
}
if (body.keywords.some((k: string) => k.length > 100)) {
  return errorResponse("BAD_REQUEST", "Keyword too long (max 100 chars)", 400);
}
```

- [ ] **Step 2: `ideas/route.ts` — limit 파라미터 상한 추가**

기존:
```ts
const limit = parseInt(searchParams.get("limit") || "50", 10);
const offset = parseInt(searchParams.get("offset") || "0", 10);
```

교체:
```ts
const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
const limit = Math.min(Math.max(1, rawLimit), 100); // 1~100 사이로 제한
const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
const offset = Math.max(0, rawOffset);
```

- [ ] **Step 3: `keywords/route.ts` POST — keyword 길이 제한**

기존:
```ts
if (!body.keyword?.trim() || !body.category) {
```

교체:
```ts
if (!body.keyword?.trim() || !body.category) {
  return errorResponse("BAD_REQUEST", "keyword and category are required", 400);
}
if (body.keyword.trim().length > 50) {
  return errorResponse("BAD_REQUEST", "Keyword too long (max 50 chars)", 400);
}
```

- [ ] **Step 4: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/api/generate/route.ts src/app/api/ideas/route.ts src/app/api/keywords/route.ts
git commit -m "fix: add input size limits for keywords array, string length, and pagination"
```

---

### Task 9: PATCH body 필드 화이트리스트

**Files:**
- Modify: `src/app/api/ideas/[id]/route.ts:66-70`

현재 문제:
```ts
const updateData: Record<string, unknown> = {
  ...body,  // ← body의 모든 필드가 그대로 Firestore에 들어감
  last_reviewed: FieldValue.serverTimestamp(),
};
```

공격 예시: `body = { user_id: "attacker@gmail.com", status: "archived" }` → 다른 유저에게 아이디어 이전 가능.

- [ ] **Step 1: 허용 필드만 추출하도록 수정**

```ts
// 허용된 필드만 업데이트 (user_id, id 등 민감 필드 제외)
const allowedFields: (keyof IdeaPatchInput)[] = ["status", "bookmarked"];
const updateData: Record<string, unknown> = { last_reviewed: FieldValue.serverTimestamp() };
for (const field of allowedFields) {
  if (body[field] !== undefined) {
    updateData[field] = body[field];
  }
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
npx tsc --noEmit && echo "✓ OK"
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/ideas/[id]/route.ts
git commit -m "fix: whitelist allowed fields in PATCH /api/ideas/[id] to prevent field injection"
```

---

## 검증 체크리스트

모든 Task 완료 후 아래 항목 수동 확인:

```
[ ] C1: /api/report — 다른 유저 idea_id로 POST → 404 반환 확인
[ ] C2: /api/evaluate — 다른 유저 idea_id로 POST → 404 반환 확인
[ ] C3: /api/health — 응답에 OpenAI 실호출 없음 (openai.status: "configured")
[ ] H1: /api/generate 11회 연속 호출 → 11번째에 429 반환 확인
[ ] H1: /api/report 6회 연속 호출 → 6번째에 429 반환 확인
[ ] H2: firestore.rules 배포 완료 (Firebase 콘솔 확인)
[ ] M1: keywords 배열 21개로 /api/generate POST → 400 반환
[ ] M2: limit=99999로 /api/ideas GET → 실제 limit이 100으로 캡 확인
[ ] M3: PATCH body에 user_id 포함 → Firestore에 user_id 변경 안됨 확인
```

```bash
# 전체 빌드 확인
npx tsc --noEmit && npx next build
```

---

## 수정 우선순위 요약

```
즉시 (Critical):
  Task 1: IDOR /api/report            ← 비용 공격 방어
  Task 2: IDOR /api/evaluate          ← 비용 공격 방어
  Task 3: /api/health OpenAI 제거     ← 비용 공격 방어

이번 세션 (High):
  Task 4-6: Rate limiting             ← AI 비용 보호
  Task 7: Firestore rules             ← 미래 대비

다음 세션 (Medium):
  Task 8: 입력 크기 제한
  Task 9: PATCH 필드 화이트리스트
```
