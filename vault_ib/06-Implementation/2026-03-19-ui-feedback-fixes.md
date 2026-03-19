# UI Feedback Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** P0~P3 UI 피드백 7개 항목 전체 구현 — 상태 불일치 수정, 에러 토스트, 아코디언 indicator, 빈 상태 개선, 평가 해석, Blueprint 가독성, 접근성.

**Architecture:** 기존 컴포넌트를 최소 수정. 외부 라이브러리는 sonner(toast) 하나만 추가. 각 태스크는 독립적이며 순서대로 진행.

**Tech Stack:** Next.js App Router, Tailwind CSS, shadcn/ui, sonner (신규 설치), lucide-react

---

## Chunk 1: P0 + P1 — 데이터 신뢰성 & 사용자 피드백

### Task 1: P0 — STATUS_COLUMNS에 interested·executing 추가 + Kanban 그리드 수정

**Files:**
- Modify: `src/lib/constants.ts:59-64`
- Modify: `src/components/idea-kanban.tsx:27`

- [ ] **Step 1: constants.ts — STATUS_COLUMNS에 interested, executing 추가**

`src/lib/constants.ts`의 STATUS_COLUMNS를 아래로 교체:
```ts
export const STATUS_COLUMNS: IdeaStatus[] = [
  "new",
  "interested",
  "reviewing",
  "executing",
  "on_hold",
  "archived",
];
```

- [ ] **Step 2: idea-kanban.tsx — 그리드 cols 6열로 수정**

`src/components/idea-kanban.tsx` line 27의 grid 클래스:
```tsx
// Before
className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4"
// After
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pb-4"
```

- [ ] **Step 3: 브라우저에서 /ideas Kanban 뷰 확인 — 6개 컬럼 모두 표시되는지 확인**

- [ ] **Step 4: Commit**
```bash
git add src/lib/constants.ts src/components/idea-kanban.tsx
git commit -m "fix: expose interested/executing statuses in Kanban and status select"
```

---

### Task 2: P1a — sonner 설치 + Toaster 연결

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: sonner 설치**
```bash
npm install sonner
```

- [ ] **Step 2: layout.tsx에 Toaster 추가**

`src/app/layout.tsx` import 추가:
```tsx
import { Toaster } from "sonner";
```

`<AuthLayout>` 아래에 추가:
```tsx
<SessionProvider>
  <AuthLayout>{children}</AuthLayout>
  <Toaster position="bottom-right" richColors />
</SessionProvider>
```

- [ ] **Step 3: Commit**
```bash
git add src/app/layout.tsx package.json package-lock.json
git commit -m "feat: add sonner Toaster to root layout"
```

---

### Task 3: P1a — handleBookmarkToggle / handleStatusChange 에러 토스트

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/ideas/page.tsx`
- Modify: `src/app/ideas/[id]/page.tsx`

각 파일의 catch 블록에 `toast.error(...)` 추가 패턴:
```tsx
import { toast } from "sonner";

// handleBookmarkToggle
} catch {
  toast.error("북마크 변경에 실패했습니다");
}

// handleStatusChange
} catch {
  toast.error("상태 변경에 실패했습니다");
}
```

- [ ] **Step 1: src/app/page.tsx — handleBookmarkToggle catch에 toast.error 추가**

`import { toast } from "sonner";` 추가 후:
```tsx
const handleBookmarkToggle = async (id: string, value: boolean) => {
  try {
    await patchIdea(id, { bookmarked: value });
    refetch();
  } catch {
    toast.error("북마크 변경에 실패했습니다");
  }
};
```

- [ ] **Step 2: src/app/ideas/page.tsx — handleStatusChange + handleBookmarkToggle catch에 toast.error 추가**

```tsx
import { toast } from "sonner";

const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
  try {
    await patchIdea(id, { status: newStatus });
    refetch();
  } catch {
    toast.error("상태 변경에 실패했습니다");
  }
};

const handleBookmarkToggle = async (id: string, bookmarked: boolean) => {
  try {
    await patchIdea(id, { bookmarked });
    refetch();
  } catch {
    toast.error("북마크 변경에 실패했습니다");
  }
};
```

- [ ] **Step 3: src/app/ideas/[id]/page.tsx — handleStatusChange + handleBookmarkToggle catch에 toast.error 추가**

```tsx
import { toast } from "sonner";

const handleStatusChange = async (newStatus: IdeaStatus) => {
  try {
    await patchIdea(id, { status: newStatus });
    refetch();
  } catch {
    toast.error("상태 변경에 실패했습니다");
  }
};

const handleBookmarkToggle = async () => {
  if (!idea) return;
  try {
    await patchIdea(id, { bookmarked: !idea.bookmarked });
    refetch();
  } catch {
    toast.error("북마크 변경에 실패했습니다");
  }
};
```

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx src/app/ideas/page.tsx "src/app/ideas/[id]/page.tsx"
git commit -m "feat: show error toast on bookmark/status change failure"
```

---

### Task 4: P1b — RationaleAccordion chevron indicator 추가

**Files:**
- Modify: `src/components/rationale-accordion.tsx`

- [ ] **Step 1: summary에 ChevronDown 아이콘 추가 (group-open으로 회전)**

`lucide-react`에서 `ChevronDown` import 추가 후, summary 내부 우측에:
```tsx
import { Info, AlertTriangle, HelpCircle, ChevronDown } from "lucide-react";

// summary 안의 <span> (score badge) 앞에 chevron 삽입:
<summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
  <div className="flex items-center gap-3">
    <ChevronDown className="size-4 text-text-muted transition-transform duration-200 group-open:rotate-180" />
    <span className="text-sm font-bold text-text-main">
      {DIMENSION_LABELS[dimension] ?? dimension}
    </span>
    <span className="text-xs text-text-muted">
      가중치 {(weight * 100).toFixed(0)}%
    </span>
  </div>
  <span className={cn(...)}>
    {score}
  </span>
</summary>
```

- [ ] **Step 2: 브라우저에서 평가 탭 — 아코디언 열림/닫힘 시 chevron 회전 확인**

- [ ] **Step 3: Commit**
```bash
git add src/components/rationale-accordion.tsx
git commit -m "fix: add chevron rotation indicator to rationale accordion"
```

---

## Chunk 2: P2 — 빈 상태 개선 + 평가 해석

### Task 5: P2a — Kanban 빈 컬럼 empty state 개선

**Files:**
- Modify: `src/components/idea-kanban.tsx`

- [ ] **Step 1: 컬럼별 contextual 빈 상태 메시지 추가**

status별 안내 메시지 맵을 컴포넌트 위에 정의:
```tsx
const COLUMN_EMPTY_HINTS: Record<IdeaStatus, { icon: string; text: string }> = {
  new: { icon: "✦", text: "아이디어 생성 후 자동으로 추가됩니다" },
  interested: { icon: "★", text: "관심 있는 아이디어를 여기로 옮기세요" },
  reviewing: { icon: "🔍", text: "깊게 탐구할 아이디어를 옮기세요" },
  executing: { icon: "⚡", text: "실행 중인 아이디어가 여기 표시됩니다" },
  on_hold: { icon: "⏸", text: "잠시 보류 중인 아이디어" },
  archived: { icon: "📦", text: "보관된 아이디어가 여기 있습니다" },
};
```

빈 상태 JSX:
```tsx
{columnIdeas.length === 0 && (
  <div className="text-center py-8 px-2">
    <div className="text-2xl mb-2">{COLUMN_EMPTY_HINTS[status].icon}</div>
    <p className="text-xs text-text-muted leading-snug">
      {COLUMN_EMPTY_HINTS[status].text}
    </p>
  </div>
)}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/idea-kanban.tsx
git commit -m "feat: contextual empty state messages per Kanban column"
```

---

### Task 6: P2a — IdeaList 빈 상태 개선 (CTA 포함)

**Files:**
- Modify: `src/components/idea-list.tsx`

- [ ] **Step 1: 빈 상태에 Link CTA 추가**

`next/link` import 추가 후:
```tsx
import Link from "next/link";

{ideas.length === 0 && (
  <div className="bg-surface rounded-card-lg shadow-marshmallow-inset p-12 text-center space-y-3">
    <p className="text-text-muted text-sm">아직 아이디어가 없습니다</p>
    <p className="text-xs text-text-muted">
      매일 5분 키워드를 조합해 첫 아이디어를 만들어 보세요
    </p>
    <Link
      href="/generate"
      className="inline-block mt-2 text-xs font-semibold text-primary underline underline-offset-2"
    >
      아이디어 생성하러 가기 →
    </Link>
  </div>
)}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/idea-list.tsx
git commit -m "feat: improve empty state in IdeaList with CTA link"
```

---

### Task 7: P2b — 평가 화면에 최약 항목 하이라이트 + 해석 기준 추가

**Files:**
- Modify: `src/components/evaluation-view.tsx`

- [ ] **Step 1: 최약 항목 계산 + 경고 배너 추가**

`evaluation-view.tsx`에서 점수 섹션 위에:
```tsx
// 최약 항목 계산
const weakestDim = (["market", "build", "edge", "money"] as const).reduce(
  (min, dim) => evaluation.scores[dim] < evaluation.scores[min] ? dim : min,
  "market" as "market" | "build" | "edge" | "money"
);

const DIMENSION_KO: Record<string, string> = {
  market: "시장성",
  build: "실행 가능성",
  edge: "독창성",
  money: "수익성",
};
```

점수 바 루프에서 최약 항목일 때 하이라이트:
```tsx
// 바 색상 조건부:
className={cn(
  "h-full rounded-full transition-all duration-500 ease-out",
  dim === weakestDim ? "bg-score-low-stroke" : "bg-primary"
)}
```

그리고 최약 항목 경고 배너를 점수 섹션 아래에 추가:
```tsx
{evaluation.scores[weakestDim] < 60 && (
  <div className="flex items-start gap-2 bg-score-low-bg rounded-xl px-4 py-3 border border-score-low-stroke/30">
    <AlertTriangle className="size-4 text-score-low-text shrink-0 mt-0.5" />
    <p className="text-sm text-score-low-text">
      <span className="font-bold">{DIMENSION_KO[weakestDim]}</span>이 가장 취약합니다 ({evaluation.scores[weakestDim]}점). 아코디언을 펼쳐 근거와 반론을 확인하세요.
    </p>
  </div>
)}
```

`AlertTriangle`을 lucide-react에서 import 추가.

- [ ] **Step 2: ScoreRing 아래 해석 기준 라벨 추가 (80+ 우수 / 60+ 양호 / 미만 보완 필요)**

ScoreRing 컴포넌트 아래:
```tsx
<div className="flex justify-center mt-1">
  <div className="flex gap-3 text-[10px] text-text-muted">
    <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-score-high-stroke" />80+ 우수</span>
    <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-score-mid-stroke" />60+ 양호</span>
    <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-score-low-stroke" />미만 보완</span>
  </div>
</div>
```

- [ ] **Step 3: 브라우저에서 평가 탭 확인 — 최약 항목 하이라이트 + 배너 표시 확인**

- [ ] **Step 4: Commit**
```bash
git add src/components/evaluation-view.tsx
git commit -m "feat: highlight weakest dimension and add score interpretation in evaluation view"
```

---

## Chunk 3: P3 — Blueprint 가독성 + 접근성

### Task 8: P3a — Blueprint 섹션 라벨 overflow 및 모바일 클리핑 수정

**Files:**
- Modify: `src/components/deep-report-view.tsx`

- [ ] **Step 1: article의 overflow-hidden 제거 (장식 라벨 클리핑 원인)**

line 23:
```tsx
// Before
<article className="paper-texture rounded-2xl shadow-marshmallow p-8 md:p-12 max-w-[800px] mx-auto relative overflow-hidden">
// After
<article className="paper-texture rounded-2xl shadow-marshmallow p-8 md:p-12 max-w-[800px] mx-auto relative">
```

- [ ] **Step 2: Section 컴포넌트 — 모바일에서 장식 라벨 position 안전하게 수정**

`Section` 컴포넌트의 장식 라벨 div:
```tsx
// Before
<div className={cn("absolute -left-3 -top-5 md:-left-8 transform", rotate)}>
// After
<div className={cn("absolute left-0 -top-6 md:-left-6 transform", rotate)}>
```

- [ ] **Step 3: 브라우저 모바일 뷰(375px)에서 라벨 클리핑 없는지 확인**

- [ ] **Step 4: Commit**
```bash
git add src/components/deep-report-view.tsx
git commit -m "fix: remove overflow-hidden from Blueprint article to prevent label clipping on mobile"
```

---

### Task 9: P3b — LoadingSkeleton 접근성 속성 추가

**Files:**
- Modify: `src/components/loading-skeleton.tsx`
- Modify: `src/app/ideas/page.tsx`

- [ ] **Step 1: LoadingSkeleton에 role + aria-label 추가**

`src/components/loading-skeleton.tsx` 반환 JSX를 `<div role="status" aria-label="로딩 중">` 래퍼로 감싸기:

```tsx
return (
  <div role="status" aria-label="로딩 중">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn(baseClass, variantClass, className)} />
    ))}
    <span className="sr-only">로딩 중...</span>
  </div>
);
```

- [ ] **Step 2: src/app/ideas/page.tsx — 로딩 구간에 aria-live 추가**

ideas/page.tsx의 로딩 상태 반환부를 찾아 래핑:
```tsx
if (loading) {
  return (
    <div aria-live="polite" aria-busy="true">
      <LoadingSkeleton ... />
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/loading-skeleton.tsx src/app/ideas/page.tsx
git commit -m "feat: add aria-busy/role=status/sr-only to loading skeleton for screen reader support"
```

---

## 완료 기준

- [ ] Kanban에 6개 컬럼 전부 표시됨 (new, interested, reviewing, executing, on_hold, archived)
- [ ] 아이디어 상세의 상태 Select에 6개 항목 전부 표시됨
- [ ] 북마크/상태 변경 실패 시 하단 toast 표시
- [ ] RationaleAccordion 열림/닫힘 시 chevron 회전
- [ ] Kanban 빈 컬럼마다 컨텍스트 안내 메시지 표시
- [ ] IdeaList 빈 상태에 생성 페이지 CTA 링크 표시
- [ ] 평가 뷰에서 최약 항목 바 색상 변경 + 경고 배너 표시 (60 미만일 때)
- [ ] 점수 해석 기준 범례 (80+/60+/미만) 표시
- [ ] Blueprint 모바일에서 섹션 라벨 클리핑 없음
- [ ] LoadingSkeleton에 role="status", aria-label, sr-only 텍스트 포함
