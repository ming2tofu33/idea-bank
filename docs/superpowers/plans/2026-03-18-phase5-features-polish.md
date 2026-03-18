# Phase 5: Features & Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세션 로그 자동 저장, 14일 방치 자동 아카이브, 대시보드 강화(방치 알림 + 월간 비용)를 구현하여 V1 MVP를 완성한다.

**Architecture:** Generate API에 세션 로깅 추가, 서버 유틸리티로 stale 감지 함수 생성, 대시보드에서 접속 시 stale 체크 + ai_runs 비용 집계 API 호출. Serendipity 추천은 이미 구현 완료(랜덤 방식, MVP 충분).

**Tech Stack:** Next.js API Routes, Firebase Firestore, TypeScript

---

## Completed (Skip)

- ~~Task 5.1: Serendipity 추천~~ — 이미 구현 (`src/lib/serendipity.ts` + `src/components/serendipity-card.tsx`)

## File Structure

```
src/
├── server/
│   └── stale-checker.ts          (CREATE) — 14일 방치 감지 + 아카이브
├── app/
│   ├── api/
│   │   ├── generate/route.ts     (MODIFY) — 세션 로그 저장 추가
│   │   └── stats/route.ts        (CREATE) — 방치 수 + 월간 비용 집계 API
│   └── page.tsx                  (MODIFY) — 대시보드에 방치 알림 + 비용 표시
├── lib/
│   └── api.ts                    (MODIFY) — fetchStats 함수 추가
└── types/
    └── api.ts                    (MODIFY) — StatsResponse 타입 추가
```

---

## Chunk 1: Session Logging + Stale Checker + Stats API

### Task 5.2: 세션 로그 자동 저장

**Files:**
- Modify: `src/app/api/generate/route.ts`

세션 로그는 아이디어 생성 완료 후 `sessions` 컬렉션에 기록한다. `ideas_bookmarked`와 `ideas_discarded`는 생성 시점에서는 알 수 없으므로 빈 배열로 초기화하고, 세션 ID를 응답에 포함한다.

- [ ] **Step 1: Generate API에 세션 로깅 추가**

`src/app/api/generate/route.ts`에서 아이디어 저장 후, sessions 컬렉션에 문서 추가:

```typescript
// 기존 코드 "// 6. Update ai_run log" 직전에 추가
const startTime = Date.now(); // 함수 시작 부분에서 기록

// 7. Save session log
const sessionRef = await collections.sessions.add({
  session_date: FieldValue.serverTimestamp(),
  session_type: "diverge",
  keywords_selected: body.keywords,
  generation_mode: body.mode,
  ideas_generated: savedIds.length,
  ideas_bookmarked: [],
  ideas_discarded: [],
  session_duration: Math.round((Date.now() - startTime) / 1000),
});
```

응답에 `session_id` 포함:
```typescript
return NextResponse.json({
  ...validation.data,
  saved_ids: savedIds,
  session_id: sessionRef.id,
});
```

- [ ] **Step 2: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat: add automatic session logging to generate API"
```

---

### Task 5.3: 14일 방치 자동 아카이브

**Files:**
- Create: `src/server/stale-checker.ts`

대시보드 접속 시 호출. `last_reviewed`가 14일 이전이고 status가 archived가 아닌 아이디어를 찾아 archived로 전환.

- [ ] **Step 1: stale-checker 구현**

```typescript
// src/server/stale-checker.ts
import { collections } from "@/server/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function checkStaleIdeas(): Promise<number> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Firestore는 != 쿼리 + < 쿼리 동시 사용 불가
  // 전체 조회 후 클라이언트 필터링
  const snapshot = await collections.ideas
    .where("last_reviewed", "<", fourteenDaysAgo)
    .get();

  const staleIds: string[] = [];
  snapshot.docs.forEach((doc) => {
    const status = doc.data().status as string;
    if (status !== "archived") {
      staleIds.push(doc.id);
    }
  });

  // Batch update
  if (staleIds.length > 0) {
    const batch = collections.ideas.firestore.batch();
    for (const id of staleIds) {
      batch.update(collections.ideas.doc(id), {
        status: "archived",
        stale_flag: true,
        last_reviewed: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }

  return staleIds.length;
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 3: 커밋**

```bash
git add src/server/stale-checker.ts
git commit -m "feat: add 14-day stale idea auto-archive checker"
```

---

### Task 5.4: Stats API (방치 + 비용 집계)

**Files:**
- Create: `src/app/api/stats/route.ts`
- Modify: `src/types/api.ts` — StatsResponse 추가
- Modify: `src/lib/api.ts` — fetchStats 함수 추가

대시보드용 통합 API. 한 번의 호출로 stale 체크 실행 + 월간 비용 집계 + 최근 세션 수를 반환.

- [ ] **Step 1: StatsResponse 타입 추가**

`src/types/api.ts` 끝에 추가:

```typescript
/** GET /api/stats */
export interface StatsResponse {
  stale_archived_count: number;
  monthly_cost_usd: number;
  monthly_api_calls: number;
  sessions_this_week: number;
}
```

- [ ] **Step 2: Stats API 구현**

`src/app/api/stats/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { checkStaleIdeas } from "@/server/stale-checker";

// o4-mini pricing (per 1K tokens)
const PRICING = {
  "o4-mini": { input: 0.00110, output: 0.00440 },
  "gpt-4o":  { input: 0.00250, output: 0.01000 },
} as Record<string, { input: number; output: number }>;

export async function GET() {
  // 1. Run stale check
  const staleCount = await checkStaleIdeas();

  // 2. Monthly cost from ai_runs
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const aiRuns = await collections.aiRuns
    .where("created_at", ">=", monthStart)
    .get();

  let totalCost = 0;
  let callCount = 0;
  aiRuns.docs.forEach((doc) => {
    const data = doc.data();
    const pricing = PRICING[data.model] ?? PRICING["gpt-4o"];
    totalCost +=
      (data.input_tokens / 1000) * pricing.input +
      (data.output_tokens / 1000) * pricing.output;
    callCount++;
  });

  // 3. Sessions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessions = await collections.sessions
    .where("session_date", ">=", weekAgo)
    .get();

  return NextResponse.json({
    stale_archived_count: staleCount,
    monthly_cost_usd: Math.round(totalCost * 1000) / 1000,
    monthly_api_calls: callCount,
    sessions_this_week: sessions.size,
  });
}
```

- [ ] **Step 3: API 클라이언트에 fetchStats 추가**

`src/lib/api.ts`에 추가:

```typescript
import type { StatsResponse } from "@/types";

export function fetchStats(): Promise<StatsResponse> {
  return request("/api/stats");
}
```

- [ ] **Step 4: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 5: 커밋**

```bash
git add src/types/api.ts src/app/api/stats/ src/lib/api.ts
git commit -m "feat: add stats API with stale check, cost tracking, session count"
```

---

## Chunk 2: Dashboard Enhancement

### Task 5.5: 대시보드에 방치 알림 + 비용 표시

**Files:**
- Modify: `src/app/page.tsx`

Stats API 호출하여 방치 아카이브 수, 월간 비용, 주간 세션 수를 표시.

- [ ] **Step 1: Dashboard에 stats 연동**

`src/app/page.tsx`에서:

1. `fetchStats` import 추가
2. `useFetch`로 stats 호출
3. 기존 Stats 섹션(3개 카드)을 5개로 확장:
   - 전체 아이디어 (기존)
   - 북마크 (기존)
   - 검토 중 (기존)
   - 방치 아카이브 (NEW — stale_archived_count, 0이면 초록, 1+ 이면 경고 amber)
   - 월간 비용 (NEW — $X.XX / $30.00 형태)

Stats grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`

방치 알림이 1개 이상이면 Stats 카드 위에 경고 배너 표시:
```tsx
{stats?.stale_archived_count > 0 && (
  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-card p-4 flex items-center gap-3">
    <Archive className="size-5 text-amber-500" />
    <span className="text-sm text-amber-800">
      {stats.stale_archived_count}개 아이디어가 14일 이상 방치되어 자동 아카이브되었습니다.
    </span>
  </div>
)}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 3: 빌드 확인**

Run: `npx next build`
Expected: 모든 라우트 정상

- [ ] **Step 4: 커밋**

```bash
git add src/app/page.tsx
git commit -m "feat: add stale alert and monthly cost to dashboard"
```

---

## Verification

```bash
# 1. TypeScript 컴파일
npx tsc --noEmit

# 2. 빌드
npx next build

# 3. E2E 수동 테스트 (npm run dev)
# Step A: /generate에서 아이디어 생성 → Firestore sessions 컬렉션에 문서 생성 확인
# Step B: / 대시보드 접속 → stale 체크 실행 + 비용 표시 확인
# Step C: 방치 아이디어가 있으면 경고 배너 표시 확인

# 4. Git 로그
git log --oneline
```

**Phase 5 완료 후 신규/수정 파일:**
```
src/server/stale-checker.ts      (NEW)
src/app/api/stats/route.ts       (NEW)
src/app/api/generate/route.ts    (MODIFIED — session logging)
src/types/api.ts                 (MODIFIED — StatsResponse)
src/lib/api.ts                   (MODIFIED — fetchStats)
src/app/page.tsx                 (MODIFIED — stale alert + cost)
```
