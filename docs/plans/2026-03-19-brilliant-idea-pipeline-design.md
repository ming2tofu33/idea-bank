# Brilliant Idea Pipeline Design

**Date:** 2026-03-19

**Goal:** Improve the brilliance of one-line generated ideas without drifting into obscure or impractical concepts.

## Context

The current `/api/generate` flow creates 10 final-form ideas in a single model call. That keeps the implementation simple, but it pushes the model toward safe, polished, average outputs. Recent in-progress changes already improved prompt structure by sending categorized keywords instead of a flat list. The next improvement should preserve that work and raise output quality without requiring a UI rewrite.

## Approaches Considered

### 1. Stronger Single Prompt

Keep one model call and add stricter instructions for surprise, clarity, and realism.

**Pros**
- Lowest latency and cost
- Minimal code churn

**Cons**
- Limited headroom because the model still has to invent, score, and polish in one pass
- Hard to prevent “safe but bland” or “novel but weird” outputs consistently

### 2. Two-Stage Pipeline: Seed, Then Curate and Rewrite

First call generates a wide pool of rough idea seeds. Second call scores and rewrites only the strongest seeds into final one-line ideas. Local code enforces guardrails on clarity, feasibility, and urgency before the final rewrite.

**Pros**
- Best quality-per-complexity tradeoff
- Creates room for surprising ideas before polish
- Guardrails can explicitly filter out obscure candidates
- Keeps the public API contract unchanged

**Cons**
- Higher latency and token cost than one call
- Requires new prompt and validation layers

### 3. Full Three-Stage Pipeline: Seed, Score, Rewrite

Generate raw seeds, run a dedicated scoring pass, then run a separate rewrite pass for finalists.

**Pros**
- Highest controllability
- Clear separation between generation and evaluation

**Cons**
- Highest latency and cost
- More moving parts than needed for the current project stage

## Recommendation

Use **Approach 2**, a two-stage pipeline behind the existing `/api/generate` endpoint.

This gives the app a meaningful quality jump now, while leaving room to evolve into a three-stage pipeline later if the team wants more control. It also aligns well with the current `categorizedKeywords` refactor already present in the working tree.

## Proposed Behavior

### Stage 1: Seed Generation

Generate a larger set of rough concepts instead of final polished ideas.

Each seed should focus on:
- target user
- painful moment
- unusual wedge
- why now
- idea nucleus

The prompt should explicitly prefer bold but understandable concepts and forbid generic “AI SaaS for X” outputs.

### Stage 2: Curation and Rewrite

Score or shortlist those seeds for:
- clarity
- surprise
- urgency
- feasibility
- wedge

Then apply hard guardrails:
- reject low-clarity candidates
- reject low-feasibility candidates
- reject candidates where the problem is vague but the technology sounds impressive
- reject candidates that need multiple sentences to understand

The surviving candidates are rewritten into the existing final response shape:
- title
- summary
- target_user
- problem
- solution_hint

## Architecture

- Keep the request and response path rooted at [src/app/api/generate/route.ts](/Users/amy/Desktop/Idea%20Bank/src/app/api/generate/route.ts).
- Add pipeline-specific prompt builders in [src/server/prompts/generation.ts](/Users/amy/Desktop/Idea%20Bank/src/server/prompts/generation.ts).
- Add internal validation and ranking helpers for raw seeds and curated candidates.
- Preserve the final `GenerateResponse` contract so the frontend does not need a redesign.

## Data Contract Direction

Public API:
- Keep `GenerateRequest` with categorized keywords and mode.
- Keep `GenerateResponse` for saved final ideas.

Internal pipeline:
- Introduce raw seed and curated candidate shapes for multi-step generation.
- Use a new prompt version such as `idea.v3`.

## Safety and Quality Guardrails

- Brilliant should mean “surprising but quickly understandable,” not “abstract.”
- The filter should reward one strong unexpected angle, not five conflicting angles.
- At least some diversity should remain in the final 10 results, but clarity wins over novelty when they conflict.

## Testing Strategy

Add lightweight TypeScript tests for pure pipeline logic:
- validation of raw seed responses
- filtering of obscure candidates
- ranking behavior favoring clear, urgent, differentiated ideas

The endpoint integration can remain manually verified for now.
