# Dark Mode Token Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `.dark` 블록에 누락된 accent·score 토큰을 추가하고, color-scheme·border opacity·shadow를 보정해 다크모드에서 형광/흰 glow 없이 구조가 읽히도록 수정한다.

**Architecture:** 변경은 `src/app/globals.css` 단일 파일. CSS custom property만 추가/수정하며 컴포넌트 코드는 건드리지 않는다. 모든 컴포넌트는 이미 CSS 변수를 참조하므로 토큰 수정만으로 전체 반영된다.

**Tech Stack:** Tailwind CSS v4 (`@theme`), CSS custom properties

---

## Chunk 1: P0 — 누락 토큰 추가

### Task 1: P0a — `.dark` accent 색 5개 오버라이드

**Files:**
- Modify: `src/app/globals.css` (`.dark` 블록, line 222 근방)

현재 `.dark` 블록에 accent 색 오버라이드가 **전혀 없다.** 파스텔 원색이 그대로 다크 배경에 출력되어 형광처럼 보인다.

추가할 값 — 파스텔을 채도↓ 밝기↓한 어두운 tint로 교체:

```css
/* 다크 accent: 파스텔 원색 대신 채도/밝기 낮춘 dark tint */
--color-accent-peach: #3D1F1D;
--color-accent-mint:  #132A22;
--color-accent-lime:  #1A2910;
--color-accent-purple: #221533;
--color-accent-orange: #2E1A0A;
```

- [ ] **Step 1: globals.css `.dark` 블록 (~line 222)에 accent 5개 추가**

`.dark { ... }` 블록(line 223~235) 내부 끝에 아래 추가:
```css
  /* dark accent: desaturated dark tints (pastel이 형광처럼 보이는 문제 수정) */
  --color-accent-peach:  #3D1F1D;
  --color-accent-mint:   #132A22;
  --color-accent-lime:   #1A2910;
  --color-accent-purple: #221533;
  --color-accent-orange: #2E1A0A;
```

- [ ] **Step 2: 변경 후 TypeScript 빌드 에러 없는지 확인**
```bash
npx tsc --noEmit
```
Expected: 출력 없음 (에러 없음)

- [ ] **Step 3: Commit**
```bash
git add src/app/globals.css
git commit -m "fix: add dark mode accent color overrides to prevent pastel fluorescence"
```

---

### Task 2: P0b — `.dark` score semantic 색 9개 오버라이드

**Files:**
- Modify: `src/app/globals.css` (`.dark` 블록)

현재 score 색(`score-high-bg`, `score-mid-bg`, `score-low-bg` 등)이 다크에서 오버라이드되지 않아 라이트 연초록(`#dcfce7`)/연노랑(`#fef3c7`)/연빨강(`#fee2e2`)이 `#08090E` 배경 위에 그대로 표시된다.

추가할 값 — 불투명 dark tint + 가독성 높은 밝은 텍스트:

```css
/* 다크 score: rgba tint bg + 가독성 높은 텍스트/스트로크 */
--color-score-high-bg:     #0D2818;
--color-score-high-text:   #4ade80;
--color-score-high-stroke: #22c55e;
--color-score-mid-bg:      #2A1C06;
--color-score-mid-text:    #fbbf24;
--color-score-mid-stroke:  #f59e0b;
--color-score-low-bg:      #2D0A0A;
--color-score-low-text:    #f87171;
--color-score-low-stroke:  #ef4444;
```

- [ ] **Step 1: globals.css `.dark` 블록에 score 9개 추가**

accent 5개 바로 아래에 이어서:
```css
  /* dark score: dark tint bg + bright accessible text */
  --color-score-high-bg:     #0D2818;
  --color-score-high-text:   #4ade80;
  --color-score-high-stroke: #22c55e;
  --color-score-mid-bg:      #2A1C06;
  --color-score-mid-text:    #fbbf24;
  --color-score-mid-stroke:  #f59e0b;
  --color-score-low-bg:      #2D0A0A;
  --color-score-low-text:    #f87171;
  --color-score-low-stroke:  #ef4444;
```

- [ ] **Step 2: Commit**
```bash
git add src/app/globals.css
git commit -m "fix: add dark mode score semantic color overrides"
```

---

### Task 3: P0c — `color-scheme` 선언 추가

**Files:**
- Modify: `src/app/globals.css` (`:root`, `.dark`, `.pink` 블록)

`color-scheme: dark`가 없으면 브라우저 기본 UI(스크롤바, input, select)가 라이트 스타일로 렌더링된다. "앱 전체가 하나의 어두운 환경처럼 느껴지는가"에 큰 영향.

- [ ] **Step 1: `:root`에 `color-scheme: light` 추가**

`:root { ... }` 블록 첫 줄에:
```css
  color-scheme: light;
```

- [ ] **Step 2: `.dark` 블록에 `color-scheme: dark` 추가**

`.dark { ... }` 블록 첫 줄에:
```css
  color-scheme: dark;
```

- [ ] **Step 3: `.pink` 블록에 `color-scheme: light` 추가**

`.pink { ... }` 블록 첫 줄에:
```css
  color-scheme: light;
```

- [ ] **Step 4: Commit**
```bash
git add src/app/globals.css
git commit -m "feat: add color-scheme declarations to all themes"
```

---

## Chunk 2: P1 + P2 — border 및 shadow 보정

### Task 4: P1 — `.dark` border opacity 올리기

**Files:**
- Modify: `src/app/globals.css` (`.dark` 블록 line 73~74, 87)

현재:
```css
--border: rgba(200, 210, 255, 0.06);
--input:  rgba(200, 210, 255, 0.08);
--sidebar-border: rgba(200, 210, 255, 0.06);
```
`0.06`은 너무 희미해서 카드 경계가 보이지 않는다. `0.10`으로 올려 glow 없이도 구조가 읽히게 한다.

- [ ] **Step 1: `.dark` 블록의 border/input/sidebar-border opacity 수정**

```css
/* Before */
--border: rgba(200, 210, 255, 0.06);
--input:  rgba(200, 210, 255, 0.08);
--sidebar-border: rgba(200, 210, 255, 0.06);

/* After */
--border: rgba(200, 210, 255, 0.10);
--input:  rgba(200, 210, 255, 0.12);
--sidebar-border: rgba(200, 210, 255, 0.10);
```

- [ ] **Step 2: Commit**
```bash
git add src/app/globals.css
git commit -m "fix: increase dark mode border opacity for better structural visibility"
```

---

### Task 5: P2 — shadow 토큰 라이트 glow 완전 제거 확인

**Files:**
- Modify: `src/app/globals.css` (`.dark` 블록 `--shadow-*` lines 228~234)

현재 `.dark` shadow의 하이라이트 half:
```css
-4px -4px 16px rgba(100, 120, 255, 0.02)
```
`0.02`는 사실상 보이지 않아야 한다. 하지만 `@theme` 블록의 원본 정의(`-8px -8px 24px #ffffff`)가 혹시라도 static으로 컴파일될 경우를 대비해 `.dark` shadow를 single-layer로 단순화한다.

현재:
```css
--shadow-marshmallow: 4px 4px 16px rgba(0, 0, 10, 0.7),
  -4px -4px 16px rgba(100, 120, 255, 0.02);
--shadow-marshmallow-hover: 8px 8px 24px rgba(0, 0, 10, 0.8),
  -8px -8px 24px rgba(100, 120, 255, 0.03);
--shadow-marshmallow-inset: inset 4px 4px 8px rgba(0, 0, 10, 0.6),
  inset -4px -4px 8px rgba(100, 120, 255, 0.02);
```

변경 — 하이라이트 레이어 제거, 단일 드롭섀도:
```css
--shadow-marshmallow: 0 4px 20px rgba(0, 0, 15, 0.6),
  0 1px 4px rgba(0, 0, 15, 0.4);
--shadow-marshmallow-hover: 0 8px 28px rgba(0, 0, 15, 0.7),
  0 2px 6px rgba(0, 0, 15, 0.4);
--shadow-marshmallow-inset: inset 0 2px 8px rgba(0, 0, 15, 0.5);
--shadow-float: 0 20px 40px -10px rgba(107, 138, 255, 0.20);
```

- [ ] **Step 1: `.dark` 블록의 shadow 4개 값 교체**

(위 변경 내용 적용)

- [ ] **Step 2: Commit**
```bash
git add src/app/globals.css
git commit -m "fix: simplify dark mode shadows to single-layer drop shadow, remove neumorphic highlight"
```

---

## Chunk 3: P3 — 다크 팔레트 fine-tuning

### Task 6: P3 — 다크 팔레트 블루 tint 강화 (subtle)

**Files:**
- Modify: `src/app/globals.css` (`.dark` 블록 + `@theme` 커스텀 토큰의 `.dark` 오버라이드)

현재 다크 팔레트는 neutral black에 가까움. "deep navy-black" 방향으로 아주 미세하게 블루 tint를 추가해 muted/secondary 구분을 강화한다. 배경과 카드는 유지하고 secondary/muted만 조정.

현재:
```css
--secondary: #181A24;
--muted:     #181A24;
```

변경:
```css
--secondary: #161928;
--muted:     #161928;
```
(2~3 레벨 더 어두운 blue-tinted surface — 배경 `#08090E`와 카드 `#101118` 사이 구조를 더 명확하게)

- [ ] **Step 1: `.dark` 블록의 secondary/muted 값 수정**

```css
/* Before */
--secondary: #181A24;
--muted:     #181A24;
/* After */
--secondary: #161928;
--muted:     #161928;
```

그리고 `@theme` 커스텀 토큰의 `.dark` 오버라이드 블록(line 223~235)에서 `color-surface`도 카드 색과 일치시키기:
```css
/* 현재 */
--color-surface: #101118;
/* 유지 — 이미 맞음 */
```

- [ ] **Step 2: `.dark` primary-soft를 `--color-primary`(#6B8AFF)의 tint로 재조정**

현재 `--color-primary-soft: #3d4f8a`는 너무 탁함. 다크에서 hover/active surface로 쓰이므로:
```css
/* Before */
--color-primary-soft: #3d4f8a;
/* After */
--color-primary-soft: #1e2d5a;
```

- [ ] **Step 3: Commit**
```bash
git add src/app/globals.css
git commit -m "chore: fine-tune dark palette secondary/muted tints for deeper blue-black structure"
```

---

## 완료 기준

- [ ] 다크모드에서 카테고리 badge(accent-peach/mint/lime/purple/orange)가 형광/분필색 없이 어두운 tint로 표시됨
- [ ] Blueprint 섹션 라벨(Section 컴포넌트)이 다크에서 잘 보임
- [ ] 평가 화면 score 배지/바/링이 어두운 배경에서 올바른 tint로 표시됨
- [ ] 브라우저 스크롤바, select, input 등 네이티브 UI가 다크 스타일 적용됨 (color-scheme)
- [ ] 다크 카드 외곽선이 이전보다 더 선명하게 보임 (border opacity 0.06→0.10)
- [ ] 카드 shadow에서 흰 하이라이트 glow가 보이지 않음
- [ ] TypeScript 빌드 에러 없음 (`npx tsc --noEmit` 출력 없음)
