# Phase 2: Data Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Firestore CRUD API 완성 + 96개 키워드 시딩. 에러 처리 → Keywords API → Ideas API → 시딩 스크립트 순서로 구현.

**Architecture:** API Routes는 얇은 핸들러(요청 파싱 + 응답 반환)만 담당. 실제 DB 로직은 `src/server/` 아래 모듈에 위치. 에러 처리 유틸은 `src/lib/`에 공유 코드로 배치.

**Tech Stack:** Next.js 15 API Routes, Firebase Admin SDK (Firestore), TypeScript, tsx (스크립트 실행)

**Vault 참조:** `vault_ib/02-Architecture/Database-Schema.md`, `vault_ib/02-Architecture/Backend-API.md`, `vault_ib/03-Features/Idea-Lifecycle.md`, `vault_ib/99-Reference/Keyword-Pool.md`

---

## Task 2.1: 에러 처리 유틸리티

**Files:**
- Create: `src/lib/errors.ts`

> 모든 API Route에서 재사용하는 통일된 에러 응답 헬퍼와 Firestore 저장 재시도 래퍼.

### Step 1: 에러 헬퍼 구현

**File:** `src/lib/errors.ts`

```typescript
import { NextResponse } from "next/server";
import type { ErrorCode, ErrorResponse } from "@/types";

/** Create a unified error NextResponse */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: string,
) {
  const body: ErrorResponse = { error: true, code, message, ...(details && { details }) };
  return NextResponse.json(body, { status });
}

/** Firestore write with retry (max 3 attempts, exponential backoff) */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Unreachable");
}
```

### Step 2: TypeScript 컴파일 확인

Run: `npx tsc --noEmit`
Expected: 에러 없음

### Step 3: 커밋

```bash
git add src/lib/errors.ts
git commit -m "feat: add unified error response helper and Firestore retry wrapper"
```

---

## Task 2.2: Keywords API

**Files:**
- Create: `src/app/api/keywords/route.ts` — GET(카테고리별 목록), POST(커스텀 추가)
- Create: `src/app/api/keywords/[id]/route.ts` — DELETE(커스텀만 삭제)

**Reuse:** `src/server/firebase.ts` → `collections.keywords`, `src/lib/errors.ts` → `errorResponse`

### Step 1: GET + POST 구현

**File:** `src/app/api/keywords/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
import { FieldValue } from "firebase-admin/firestore";
import type { KeywordCreateInput } from "@/types";

// GET /api/keywords — 전체 키워드 목록 (카테고리별 그룹 가능)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    let query: FirebaseFirestore.Query = collections.keywords;
    if (category) {
      query = query.where("category", "==", category);
    }
    query = query.orderBy("category").orderBy("keyword");

    const snapshot = await query.get();
    const keywords = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ keywords });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// POST /api/keywords — 커스텀 키워드 추가
export async function POST(request: NextRequest) {
  try {
    const body: KeywordCreateInput = await request.json();

    if (!body.keyword?.trim() || !body.category) {
      return errorResponse("BAD_REQUEST", "keyword and category are required", 400);
    }

    const validCategories = ["who", "domain", "tech", "value", "money"];
    if (!validCategories.includes(body.category)) {
      return errorResponse("BAD_REQUEST", `Invalid category. Must be one of: ${validCategories.join(", ")}`, 400);
    }

    const docRef = await collections.keywords.add({
      keyword: body.keyword.trim(),
      category: body.category,
      source: "custom",
      added_at: FieldValue.serverTimestamp(),
      used_count: 0,
      last_used: null,
    });

    return NextResponse.json({ id: docRef.id, keyword: body.keyword.trim(), category: body.category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
```

### Step 2: DELETE 구현

**File:** `src/app/api/keywords/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";

// DELETE /api/keywords/[id] — 커스텀 키워드만 삭제 가능
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await collections.keywords.doc(id).get();

    if (!doc.exists) {
      return errorResponse("NOT_FOUND", "Keyword not found", 404);
    }

    const data = doc.data();
    if (data?.source === "fixed") {
      return errorResponse("BAD_REQUEST", "Cannot delete fixed keywords", 400);
    }

    await collections.keywords.doc(id).delete();
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
```

### Step 3: curl로 수동 테스트

```bash
npm run dev

# GET — 전체 목록 (시딩 전이면 빈 배열)
curl http://localhost:3000/api/keywords

# POST — 커스텀 키워드 추가
curl -X POST http://localhost:3000/api/keywords -H "Content-Type: application/json" -d '{"keyword":"테스트","category":"tech"}'

# GET — 방금 추가한 키워드 확인
curl http://localhost:3000/api/keywords?category=tech

# DELETE — 커스텀 키워드 삭제 (위에서 받은 id 사용)
curl -X DELETE http://localhost:3000/api/keywords/<id>
```

### Step 4: 커밋

```bash
git add src/app/api/keywords/
git commit -m "feat: add keywords CRUD API routes (GET, POST, DELETE)"
```

---

## Task 2.3: Ideas API (기본 CRUD)

**Files:**
- Create: `src/app/api/ideas/route.ts` — GET(필터/정렬/페이지네이션), POST(저장)
- Create: `src/app/api/ideas/[id]/route.ts` — GET(상세), PATCH(상태/북마크 변경)

**Reuse:** `collections.ideas`, `errorResponse`, `withRetry`

### Step 1: GET(목록) + POST(저장) 구현

**File:** `src/app/api/ideas/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse, withRetry } from "@/lib/errors";
import { FieldValue } from "firebase-admin/firestore";
import type { IdeaCreateInput } from "@/types";

// GET /api/ideas — 목록 (필터, 정렬, 페이지네이션)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const bookmarked = searchParams.get("bookmarked");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query: FirebaseFirestore.Query = collections.ideas;

    if (status) query = query.where("status", "==", status);
    if (bookmarked === "true") query = query.where("bookmarked", "==", true);

    query = query.orderBy("created_at", "desc").limit(limit).offset(offset);

    const snapshot = await query.get();
    const ideas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ ideas, count: ideas.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// POST /api/ideas — 아이디어 저장 (생성 API에서 내부 호출용)
export async function POST(request: NextRequest) {
  try {
    const body: IdeaCreateInput = await request.json();

    if (!body.title?.trim()) {
      return errorResponse("BAD_REQUEST", "title is required", 400);
    }

    const docRef = await withRetry(() =>
      collections.ideas.add({
        ...body,
        title: body.title.trim(),
        summary: body.summary?.trim() || "",
        status: body.status || "new",
        bookmarked: body.bookmarked || false,
        created_at: FieldValue.serverTimestamp(),
        last_reviewed: FieldValue.serverTimestamp(),
        stale_flag: false,
        duplicate_warning: false,
        deep_report_id: null,
        evaluation_id: null,
        total_score: null,
      }),
    );

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
```

### Step 2: GET(상세) + PATCH(업데이트) 구현

**File:** `src/app/api/ideas/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/server/firebase";
import { errorResponse } from "@/lib/errors";
import { FieldValue } from "firebase-admin/firestore";
import type { IdeaPatchInput } from "@/types";

// GET /api/ideas/[id] — 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await collections.ideas.doc(id).get();

    if (!doc.exists) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// PATCH /api/ideas/[id] — 상태 변경, 북마크 토글
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: IdeaPatchInput = await request.json();

    const doc = await collections.ideas.doc(id).get();
    if (!doc.exists) {
      return errorResponse("NOT_FOUND", "Idea not found", 404);
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ["new", "interested", "reviewing", "executing", "on_hold", "archived"];
      if (!validStatuses.includes(body.status)) {
        return errorResponse("BAD_REQUEST", `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
      }
    }

    const updateData: Record<string, unknown> = { ...body, last_reviewed: FieldValue.serverTimestamp() };
    await collections.ideas.doc(id).update(updateData);

    const updated = await collections.ideas.doc(id).get();
    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("SAVE_FAILED", message, 500);
  }
}
```

### Step 3: curl로 수동 테스트

```bash
# POST — 테스트 아이디어 저장
curl -X POST http://localhost:3000/api/ideas -H "Content-Type: application/json" \
  -d '{"title":"테스트 아이디어","summary":"요약","keywords_used":["Z세대","핀테크"],"generation_mode":"full_match","target_user":"Z세대","problem":"문제","solution_hint":"솔루션"}'

# GET — 목록
curl http://localhost:3000/api/ideas

# GET — 상세 (위에서 받은 id)
curl http://localhost:3000/api/ideas/<id>

# PATCH — 북마크
curl -X PATCH http://localhost:3000/api/ideas/<id> -H "Content-Type: application/json" \
  -d '{"bookmarked":true}'

# PATCH — 상태 변경
curl -X PATCH http://localhost:3000/api/ideas/<id> -H "Content-Type: application/json" \
  -d '{"status":"interested"}'
```

### Step 4: 커밋

```bash
git add src/app/api/ideas/
git commit -m "feat: add ideas CRUD API routes (GET list, POST, GET detail, PATCH)"
```

---

## Task 2.4: 키워드 시딩 스크립트

**Files:**
- Create: `scripts/seed-keywords.ts`

> 96개 고정 키워드(vault_ib/99-Reference/Keyword-Pool.md)를 Firestore `keywords` 컬렉션에 일괄 삽입.

### Step 1: tsx 설치 (TypeScript 스크립트 실행용)

```bash
npm install -D tsx
```

### Step 2: 시딩 스크립트 작성

**File:** `scripts/seed-keywords.ts`

```typescript
import { collections, db } from "../src/server/firebase";

const KEYWORDS: Record<string, string[]> = {
  who: [
    "1인 가구", "Z세대", "알파세대", "실버 세대", "N잡러",
    "딩크족", "주니어 개발자", "반려동물 가구", "디지털 노마드", "소상공인(SME)",
    "취준생", "외국인 거주자", "1인 크리에이터", "환경 운동가", "나홀로 여행객",
    "사이드 프로젝트 팀", "중소기업 의사결정자(C-level)", "워킹맘/워킹대디",
    "장애인/접근성 사용자", "디지털 네이티브 시니어",
  ],
  domain: [
    "핀테크", "헬스케어", "에듀테크", "커머스", "로지스틱스",
    "스마트홈", "로컬 커뮤니티", "프롭테크", "K-컬처", "뷰티테크",
    "멘탈헬스", "트래블테크", "리걸테크", "HR-tech", "F&B(외식업)",
    "엔터테인먼트", "슬립테크", "스페이스테크", "기후테크", "사이버보안",
    "농업테크(AgriTech)", "데이팅/관계",
  ],
  tech: [
    "LLM 에이전트", "RAG(검색 증강)", "멀티모달", "노코드/로코드", "엣지 AI",
    "웨어러블", "개인화 알고리즘", "자동화 워크플로우", "벡터 데이터베이스", "TTS/STT",
    "이미지 생성 AI", "온디바이스 AI", "추천 엔진", "데이터 시각화", "디지털 트윈",
    "지식 그래프", "합성 데이터",
  ],
  value: [
    "시간 단축", "외로움 해소", "생산성 극대화", "자아실현", "비용 절감",
    "심리 케어", "연결성", "재미(Gamification)", "안전/보안", "결정 피로 감소",
    "소속감", "스킬 향상", "데이터 프라이버시", "창의적 영감", "건강 트래킹",
    "노력의 시각화", "심리적 안전감", "디지털 디톡스",
  ],
  money: [
    "구독형(SaaS)", "프리미엄(Freemium)", "중개 수수료", "데이터 판매", "광고 기반",
    "API 과금", "D2C(직판)", "화이트 라벨링", "건당 결제(Pay-per-use)", "라이선싱",
    "리퍼럴(제휴)", "하드웨어 결합형", "크라우드 펀딩", "성공 보수형", "티어드 프라이싱",
    "토큰 경제", "번들링", "마켓플레이스 수수료", "임베디드 파이낸스",
  ],
};

async function seed() {
  // Check if already seeded
  const existing = await collections.keywords.limit(1).get();
  if (!existing.empty) {
    console.log("⚠️  Keywords already exist. Delete collection first to re-seed.");
    console.log(`   Current count: ${(await collections.keywords.count().get()).data().count}`);
    return;
  }

  const batch = db.batch();
  let total = 0;

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      const ref = collections.keywords.doc();
      batch.set(ref, {
        keyword,
        category,
        source: "fixed",
        added_at: new Date(),
        used_count: 0,
        last_used: null,
      });
      total++;
    }
  }

  await batch.commit();
  console.log(`✅ Seeded ${total} keywords across ${Object.keys(KEYWORDS).length} categories`);

  // Verify counts
  for (const category of Object.keys(KEYWORDS)) {
    const count = (await collections.keywords.where("category", "==", category).count().get()).data().count;
    console.log(`   ${category}: ${count}`);
  }
}

seed().catch(console.error);
```

### Step 3: 스크립트 실행

```bash
npx tsx scripts/seed-keywords.ts
```

Expected:
```
✅ Seeded 96 keywords across 5 categories
   who: 20
   domain: 22
   tech: 17
   value: 18
   money: 19
```

### Step 4: API로 시딩 결과 확인

```bash
curl http://localhost:3000/api/keywords | head -c 200
curl "http://localhost:3000/api/keywords?category=who"
```

### Step 5: 커밋

```bash
git add scripts/seed-keywords.ts package.json package-lock.json
git commit -m "feat: add keyword seeding script with 96 fixed keywords"
```

---

## Phase 2 완료 검증

```bash
# 1. TypeScript 컴파일
npx tsc --noEmit

# 2. 개발 서버 시작
npm run dev

# 3. 키워드 API 확인
curl http://localhost:3000/api/keywords | python -m json.tool | head -20
curl -X POST http://localhost:3000/api/keywords -H "Content-Type: application/json" -d '{"keyword":"테스트 커스텀","category":"tech"}'
# → 삭제 테스트 (id로)

# 4. 아이디어 API 확인
curl -X POST http://localhost:3000/api/ideas -H "Content-Type: application/json" -d '{"title":"MVP 테스트","summary":"요약","keywords_used":["Z세대"],"generation_mode":"full_match","target_user":"Z세대","problem":"문제","solution_hint":"힌트"}'
curl http://localhost:3000/api/ideas
# → 상세 조회, PATCH 테스트

# 5. Git 로그 확인
git log --oneline
```

**기대 git log:**
```
feat: add keyword seeding script with 96 fixed keywords
feat: add ideas CRUD API routes (GET list, POST, GET detail, PATCH)
feat: add keywords CRUD API routes (GET, POST, DELETE)
feat: add unified error response helper and Firestore retry wrapper
```

**Phase 2 완료 후 프로젝트 구조:**
```
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── ideas/
│   │   │   ├── route.ts          (GET list, POST)
│   │   │   └── [id]/route.ts     (GET detail, PATCH)
│   │   └── keywords/
│   │       ├── route.ts          (GET, POST)
│   │       └── [id]/route.ts     (DELETE)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/button.tsx
├── lib/
│   ├── errors.ts                 (NEW)
│   └── utils.ts
├── server/
│   ├── firebase.ts
│   └── openai.ts
└── types/ (7 files, unchanged)

scripts/
└── seed-keywords.ts              (NEW)
```
