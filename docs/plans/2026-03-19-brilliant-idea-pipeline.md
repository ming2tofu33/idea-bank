# Brilliant Idea Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace single-pass idea generation with a two-stage seed-and-curate pipeline that produces bolder but still understandable one-line ideas.

**Architecture:** Keep the existing `/api/generate` endpoint and frontend response contract, but move the server generation flow to an internal two-step pipeline. The first prompt creates a large set of rough idea seeds, and the second prompt curates and rewrites only the strongest seeds into the final `GenerateResponse` shape. Pure helper functions handle flattening, ranking, and guardrail filtering so they can be tested independently.

**Tech Stack:** Next.js route handlers, TypeScript, OpenAI chat completions, Firebase Firestore, Node test runner via `tsx`

---

### Task 1: Add pipeline types and pure selection helpers

**Files:**
- Modify: `src/types/api.ts`
- Create: `src/server/generation-pipeline.ts`
- Test: `src/server/generation-pipeline.test.ts`

**Step 1: Write the failing test**

Create tests for:
- flattening categorized keywords into one deduplicated list
- filtering out low-clarity and low-feasibility candidates
- preferring candidates with stronger brilliance score

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: FAIL because `src/server/generation-pipeline.ts` does not exist yet.

**Step 3: Write minimal implementation**

Implement:
- raw seed and curated candidate internal types
- `flattenCategorizedKeywords`
- `selectFinalCandidates`
- brilliance score helper

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: PASS

### Task 2: Add prompt builders and validators for the two-stage flow

**Files:**
- Modify: `src/server/prompts/generation.ts`
- Modify: `src/server/validators/idea-response.ts`
- Create: `src/server/validators/generation-candidates.ts`
- Test: `src/server/generation-pipeline.test.ts`

**Step 1: Write the failing test**

Add tests for:
- seed prompt wording that asks for bold but understandable raw seeds
- curated response validation rejecting malformed candidate lists

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: FAIL because the new prompt builders and validators are missing.

**Step 3: Write minimal implementation**

Implement:
- stage 1 seed prompt builder
- stage 2 curate-and-rewrite prompt builder
- raw candidate response validator
- final idea response validator updates for `idea.v3`

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: PASS

### Task 3: Wire the generate route to the new pipeline

**Files:**
- Modify: `src/app/api/generate/route.ts`
- Modify: `src/server/openai.ts` only if a helper is needed to support pipeline-specific prompts or temperature control
- Test: `src/server/generation-pipeline.test.ts`

**Step 1: Write the failing test**

If route-level behavior can be covered with a pure helper, add one failing test for pipeline orchestration fallback behavior. Otherwise rely on the helper tests already in place and keep route verification manual.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: FAIL on the new orchestration behavior if a helper test was added.

**Step 3: Write minimal implementation**

Update the route to:
- flatten categorized keywords once
- fetch recent titles
- call stage 1 seed generation
- validate raw seeds
- call stage 2 curation/rewrite
- validate curated finalists
- save final ideas and session data as before
- log prompt version `idea.v3`

**Step 4: Run test to verify it passes**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: PASS

### Task 4: Verify type alignment and frontend contract

**Files:**
- Modify: `src/lib/api.ts` only if request typing needs cleanup
- Modify: `src/app/generate/page.tsx` only if compile fixes are needed
- Test: `src/server/generation-pipeline.test.ts`

**Step 1: Write the failing test**

No new behavior test required if the public response contract remains unchanged. Prefer compile verification here.

**Step 2: Run compile-focused verification**

Run: `npx tsc --noEmit`
Expected: FAIL if types are inconsistent after the pipeline changes.

**Step 3: Write minimal implementation**

Fix any type mismatches between route, prompt helpers, validators, and frontend caller code.

**Step 4: Run verification again**

Run: `npx tsc --noEmit`
Expected: PASS

### Task 5: Final verification

**Files:**
- No file changes expected

**Step 1: Run targeted tests**

Run: `npx tsx --test src/server/generation-pipeline.test.ts`
Expected: PASS

**Step 2: Run project verification**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Optional lint check**

Run: `npm run lint`
Expected: PASS or a report of unrelated pre-existing issues
