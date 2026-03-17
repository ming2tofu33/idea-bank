---
title: Frontend Design System
tags:
  - design
  - frontend
  - tokens
  - ui
---

# Frontend Design System

> ==Marshmallow UI== — Warm Cream 배경 위에 뉴모피즘 그림자와 파스텔 악센트를 사용하는 Idea Bank의 디자인 시스템.

---

## 1. 디자인 원칙

- **부드러움:** 날카로운 모서리 없이 둥근 카드와 pill 형태를 기본으로
- **따뜻함:** 순백이 아닌 Warm Cream 배경으로 눈의 피로 감소
- **깊이감:** Marshmallow shadow로 요소가 표면 위에 떠 있는 느낌
- **파스텔 구분:** 키워드 카테고리별 파스텔 색상으로 시각적 분류
- **최소 장식:** 콘텐츠가 주인공, 장식은 배경 blur blob 정도만

---

## 2. 디자인 토큰

### 컬러

| 토큰 | 값 | 용도 |
|---|---|---|
| `background` | ==#FDFCF8== (Warm Cream) | 전체 배경 |
| `surface` | `#FFFFFF` | 카드, 패널, 인풋 |
| `primary` | ==#136aec== | CTA 버튼, 액티브 네비, 링크 |
| `primary-soft` | `#9CB6DD` | 보조 강조, 그라디언트 |
| `text-main` | `#4A4A57` (Soft Charcoal) | 본문 텍스트 |
| `text-muted` | `#9898A6` | 부가 텍스트, 라벨 |
| `accent-peach` | ==#FFB7B2== | Who 카테고리 |
| `accent-mint` | ==#B5EAD7== | Domain 카테고리 |
| `accent-lime` | ==#E2F0CB== | Tech 카테고리 |
| `accent-purple` | `#F3E8FF` | Value 카테고리 |
| `accent-orange` | `#FFEDD5` | Money 카테고리 |

### 타이포그래피

| 토큰 | 값 | 용도 |
|---|---|---|
| `font-display` | ==Spline Sans== | 제목, 버튼, 키워드 pill |
| `font-body` | Spline Sans | 본문 텍스트 |
| 제목 크기 | `text-5xl` (3rem) | 페이지 타이틀 |
| 카드 제목 | `text-xl` (1.25rem) | 아이디어 카드 제목 |
| 본문 | `text-sm` (0.875rem) | 설명, 요약 |
| 라벨 | `text-xs` (0.75rem) | 태그, 카테고리 라벨 |

### 모서리

| 토큰 | 값 | 용도 |
|---|---|---|
| `rounded` | `1rem` (16px) | 기본 카드 |
| `rounded-lg` | `1.5rem` (24px) | 큰 카드, 패널 |
| `rounded-xl` | `2rem` (32px) | 결과 카드, 모달 |
| `rounded-2xl` | `3rem` (48px) | 대형 결과 카드 |
| `rounded-full` | `9999px` | 버튼, pill, 아바타 |

### 그림자

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-marshmallow` | `8px 8px 24px rgba(210,205,194,0.5), -8px -8px 24px #FFF` | 일반 카드 |
| `shadow-marshmallow-hover` | `12px 12px 32px rgba(210,205,194,0.6), -12px -12px 32px #FFF` | 호버 상태 |
| `shadow-marshmallow-inset` | `inset 4px 4px 8px rgba(210,205,194,0.4), inset -4px -4px 8px #FFF` | 눌림 상태, 인풋 |
| `shadow-float` | `0 20px 40px -10px rgba(19,106,236,0.2)` | Primary CTA 버튼 |

### 아이콘

- ==Material Symbols Outlined== (Google Fonts CDN)
- 기본 크기: `text-xl` (20px)
- 카드 아이콘: `text-3xl` (30px)

---

## 3. 공통 컴포넌트 패턴

### Glass Panel

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}
```

> [!note]
> 하단 독(dock), 플로팅 네비, 오버레이 패널에 사용.

### Marshmallow Card

```css
.soft-card {
  background: #FFFFFF;
  box-shadow: 8px 8px 24px rgba(210, 205, 194, 0.5), -8px -8px 24px #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.soft-card:hover {
  transform: translateY(-2px);
  box-shadow: 12px 12px 32px rgba(210, 205, 194, 0.6), -12px -12px 32px #FFFFFF;
}
```

### Keyword Pill

```css
.keyword-pill {
  height: 3rem;
  padding: 0 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.keyword-pill:hover {
  transform: scale(1.05) translateY(-2px);
}
.keyword-pill:active {
  box-shadow: inset 4px 4px 8px rgba(210, 205, 194, 0.4), inset -4px -4px 8px #FFFFFF;
  transform: scale(0.98);
}
```

### 배경 Blur Blob

```css
/* 장식용 배경 그라디언트 blob */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
/* 예: 좌상단 mint, 우하단 peach */
```

---

## 4. 키워드 카테고리 컬러 매핑

| 카테고리 | 배경색 | 텍스트색 | 도트색 |
|---|---|---|---|
| **Who** | `accent-peach/30` | `orange-600/70` | `accent-peach` |
| **Domain** | `accent-mint/30` | `teal-600/70` | `accent-mint` |
| **Tech** | `accent-lime/40` | `lime-700/70` | `accent-lime` |
| **Value** | `accent-purple/30` | `purple-600/70` | `purple-200` |
| **Money** | `primary/20` | `primary` | `primary/30` |

---

## 5. 페이지별 디자인 가이드

### `/generate` — 발산 세션

**참고:** idea2 (키워드 선택) + idea3-1 (결과 Split View)

**Step 1: 키워드 선택** (idea2 스타일)
- 카테고리별 Marshmallow pill 그리드
- 선택된 키워드는 하단 Collection Tray에 드롭
- 생성 모드 셀렉터 (Full Match / Forced Pairing / Serendipity)
- ==Dispense Idea== CTA 버튼

**Step 2: 결과 보기** (idea3-1 스타일)
- Split View: 좌측 30% 선택한 재료 / 우측 70% 결과 카드
- 결과 카드: 대형 `rounded-2xl`, 중앙 제목 + 한 줄 요약
- 액션: Remix (재생성) / Save (북마크) / Read Blueprint (상세)
- 아이디어 10개는 캐러셀 또는 스크롤

### `/ideas/[id]` — 아이디어 상세

**참고:** idea3-2 (Blueprint Reader) + idea3-3 (Feasibility Pulse)

**Deep Report 뷰** (idea3-2 스타일)
- 9개 섹션을 카드 또는 섹션 블록으로 렌더링
- 마커 하이라이트 효과로 핵심 포인트 강조
- 경쟁사 비교 테이블

**평가 뷰** (idea3-3 스타일)
- 4개 항목 점수 원형/바 차트
- 3중 구조(근거/반론/확인 필요) 플립 카드 또는 아코디언
- Next Step 제안 카드
- 종합 점수 대형 표시

### `/ideas` — 목록

**새로 설계** (동일 톤)

- **Kanban 뷰:** 상태별 컬럼 (new / interested / reviewing / executing / on_hold / archived)
  - 각 아이디어는 Marshmallow Card
  - 드래그 앤 드롭 상태 변경
- **리스트 뷰:** 테이블 형태, 정렬/필터
- 뷰 전환 토글 상단 우측
- 필터: status, bookmarked, 키워드 pill 필터

### `/keywords` — 키워드 관리

**새로 설계** (동일 톤)

- 카테고리별 탭 또는 섹션 구분 (카테고리 컬러 도트)
- 키워드를 pill 형태로 나열
- 각 pill에 사용 횟수 배지
- 커스텀 키워드 추가: 하단 인풋 + Add 버튼
- fixed 키워드는 삭제 불가 (삭제 버튼 미표시)

### `/` — 대시보드

**새로 설계** (동일 톤)

- **오늘의 추천 조합:** 3세트 카드 (Marshmallow Card, 각 카드에 키워드 pill 3~5개)
- **최근 북마크:** 최근 5개 아이디어 카드 가로 스크롤
- **방치 알림:** 아카이브된 아이디어 수 배지
- **월간 요약:** 세션 횟수, 생성 수, 비용 간단 수치

---

## 6. 레이아웃

### 사이드바 네비게이션

```
┌─────────────────────────────────────┐
│  [Logo] Idea Lab                    │
│                                     │
│  ● 대시보드        [Main Content]   │
│  ● 발산 세션                        │
│  ● 아이디어                         │
│  ● 키워드 관리                      │
│                                     │
└─────────────────────────────────────┘
```

- 좌측 사이드바: Marshmallow Card 스타일, 아이콘 + 라벨
- 모바일: 하단 탭바 또는 접이식 사이드바
- 액티브 항목: Primary 컬러 배경

---

## 7. 인터랙션 패턴

| 상호작용 | 효과 |
|---|---|
| 카드 호버 | `translateY(-2px)` + shadow 강화 |
| Pill 호버 | `scale(1.05) translateY(-2px)` |
| Pill 클릭 | inset shadow (눌림) + `scale(0.98)` |
| CTA 버튼 호버 | shadow 강화 + `translateY(-1px)` |
| 페이지 전환 | 부드러운 fade 또는 slide |
| 로딩 상태 | 펄스 애니메이션 (skeleton) |

---

## 8. 참고 예시 파일

| 파일 | 매핑 | 핵심 패턴 |
|---|---|---|
| `frontend/example/idea2.html` | `/generate` 키워드 선택 | Marshmallow pill, Collection Tray, Dispense 버튼 |
| `frontend/example/idea3-1.html` | `/generate` 결과 | Split View, 결과 카드, Remix/Save 액션 |
| `frontend/example/idea3-2.html` | `/ideas/[id]` PRD | Blueprint Reader, 마커 하이라이트 |
| `frontend/example/idea3-3.html` | `/ideas/[id]` 평가 | Feasibility Pulse, 플립 카드, 점수 시각화 |

---

## Related

(08-Design 레이어에 다른 문서 없음 — 추후 추가 시 연결)

## See Also

- [[Frontend-Structure]] — 페이지 라우팅과 컴포넌트 구조 (02-Architecture)
- [[Generation-Modes]] — 발산 세션 생성 모드 UI 요구사항 (03-Features)
