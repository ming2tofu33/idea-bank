# ⚙️ Idea Bank — Backend & AI Spec

> **문서 버전:** v1.0  
> **최종 수정:** 2026-03-10  
> **작성자:** Amy (Solo)  
> **상태:** Planning

---

## 1. 시스템 아키텍처

### 1.1 V1 — Claude Project + Notion API

```text
┌─────────────────────────────────────────┐
│              Claude Project             │
│  ┌───────────────────────────────────┐  │
│  │ System Prompt                     │  │
│  │ - 키워드 풀                       │  │
│  │ - 생성 모드 규칙                  │  │
│  │ - PRD 템플릿                      │  │
│  │ - 평가 매트릭스 규칙              │  │
│  │ - 중복 제외 리스트                │  │
│  └───────────────────────────────────┘  │
│                    │                     │
│                    ▼                     │
│  ┌───────────────────────────────────┐  │
│  │ 사용자 대화 인터페이스            │  │
│  │ 키워드 선택 → 생성 → 평가         │  │
│  └───────────────────────────────────┘  │
└────────────────────┬────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │ Notion API          │
           │ (n8n / Make 연동)   │
           │ - Ideas DB          │
           │ - Evaluations DB    │
           │ - Session Logs DB   │
           │ - Keywords DB       │
           └─────────────────────┘
```

### 1.2 V2 — Next.js 웹앱

```text
┌──────────────────────────────────────────────────┐
│                  Next.js Web App                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ 키워드     │  │ 아이디어   │  │ 평가 &     │  │
│  │ 선택 UI    │─▶│ 생성 뷰    │─▶│ 리포트 뷰  │  │
│  │ + 추천조합 │  │            │  │            │  │
│  └────────────┘  └────────────┘  └────────────┘  │
│                        │                          │
│                        ▼                          │
│  ┌──────────────────────────────────────────┐    │
│  │ Anthropic API                            │    │
│  │ - 아이디어 생성 / PRD / 평가 프롬프트   │    │
│  └──────────────────────────────────────────┘    │
│                        │                          │
│         ┌──────────────┼──────────────┐           │
│         ▼              ▼              ▼           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │ Notion    │  │ 다이내믹  │  │ 피드백    │    │
│  │ API       │  │ 키워드    │  │ 루프 분석 │    │
│  │ 저장      │  │ 파이프라인│  │ 엔진      │    │
│  └───────────┘  └───────────┘  └───────────┘    │
└──────────────────────────────────────────────────┘
```

### 1.3 실행 경계와 실패 처리

운영 중 실패는 아래 원칙으로 처리한다.

- LLM 생성 성공 후 저장 실패가 나도 재생성하지 않고 같은 payload로 저장만 재시도한다.
- 저장 재시도는 최대 3회까지 수행하고, 이후에는 `save_status=failed`로 기록한다.
- 평가 단계 실패는 아이디어 원본을 유지한 채 평가 run만 별도로 재실행한다.
- 중복 경고는 생성 실패가 아니라 `warning` 상태로 기록하고 사용자가 병합 여부를 선택한다.

---

## 2. AI 산출물 규격

### 2.1 아이디어 생성 결과

V1 생성 결과는 기본적으로 `제목 + 한 줄 요약` 형태를 따른다.

형식 규칙:

- 제목은 짧고 구분 가능해야 한다.
- 요약은 핵심 문제와 솔루션 방향이 한 줄 안에 들어가야 한다.
- 한 번 생성 시 10개 아이디어를 반환한다.

응답 계약(JSON):

```json
{
  "run_type": "idea_generation",
  "prompt_version": "idea.v1",
  "keywords_used": ["Z세대", "핀테크", "LLM 에이전트"],
  "ideas": [
    {
      "rank": 1,
      "title": "소비 버디",
      "summary": "지출 습관을 코치하는 Z세대용 금융 코파일럿",
      "target_user": "Z세대",
      "problem": "소비 통제와 기록이 잘 이어지지 않음",
      "solution_hint": "대화형 소비 피드백과 주간 리포트"
    }
  ]
}
```

### 2.2 Deep Report (PRD) 템플릿

선택한 아이디어를 아래 구조로 확장한다.

```text
1. 아이디어 요약 (엘리베이터 피치, 3문장 이내)
2. 문제 정의 (타겟의 Pain Point)
3. 솔루션 개요 (핵심 기능 3가지)
4. 타겟 사용자 페르소나 (1개)
5. 경쟁 환경 분석 (유사 서비스 2~3개, 차별점)
6. 수익 모델 (선택된 Money 키워드 기반 구체화)
7. MVP 범위 (4주 내 구현 가능한 최소 기능)
8. 핵심 리스크 (기술적/시장적 리스크 각 1개)
9. 필요 리소스 (기술 스택, 예상 개발 기간)
```

응답 계약(JSON):

```json
{
  "run_type": "deep_report",
  "prompt_version": "prd.v1",
  "idea_id": "idea_123",
  "elevator_pitch": "3문장 이내 요약",
  "problem": "핵심 pain point",
  "solution": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
  "persona": {
    "name": "Z세대 대학생",
    "context": "모바일 금융 서비스에 익숙하지만 계획 소비가 어려움"
  },
  "competition": [
    {
      "name": "Competitor A",
      "difference": "차별점 요약"
    }
  ],
  "revenue_model": "구독형",
  "mvp_scope": ["기능 1", "기능 2"],
  "risks": {
    "technical": "기술 리스크",
    "market": "시장 리스크"
  },
  "resources": {
    "stack": ["Next.js", "Notion API"],
    "timeline": "4주"
  }
}
```

---

## 3. 비즈니스 평가 매트릭스

### 3.1 평가 항목과 가중치

| 카테고리 | 가중치 | 평가 기준 |
| --- | --- | --- |
| 시장성 (Market) | 0.30 | Problem-Solution Fit, 시장 규모, 타겟 명확성 |
| 실행 가능성 (Build) | 0.25 | 기술 난이도, MVP 제작 소요 기간 |
| 독창성 (Edge) | 0.25 | 차별성, 의외성, 경쟁 우위 가능성 |
| 수익성 (Money) | 0.20 | 수익 모델의 명확성, 지속 가능성 |

윤리성은 별도 플래그로 관리한다.

- 점수에는 포함하지 않는다.
- 치명적 윤리 리스크가 있으면 경고 플래그를 세운다.

### 3.2 3중 출력 구조

각 항목은 반드시 아래 포맷을 따른다.

```text
시장성: 72/100
━━━━━━━━━━━━━━━━━━━━━━
근거: [왜 이 점수인지 구체적 이유 2~3문장]
반론: [이 점수가 과대/과소 평가일 수 있는 이유 1~2문장]
확인 필요: [검증하면 점수가 바뀔 수 있는 핵심 가정 1개]
```

출력 원칙:

- **점수:** 절대값보다 상대 비교용 수치로 사용
- **근거:** 가장 중요한 아웃풋
- **반론:** 자기 의심을 구조화해 hallucination을 완화
- **확인 필요:** 후속 검증 체크리스트 역할

### 3.3 평가 후 Next Step 규칙

| 종합 점수 | 제안 액션 |
| --- | --- |
| 80+ | 경쟁사 3곳 심층 리서치, 랜딩 페이지 초안 작성, 1주 MVP 스프린트 계획 |
| 60~79 | 확인 필요 항목 우선 리서치, 피벗 포인트 탐색 |
| 60 미만 | 핵심 가치 재정의, 키워드 조합 변경, 보류 처리 |

### 3.4 평가 응답 계약

```json
{
  "run_type": "evaluation",
  "prompt_version": "eval.v1",
  "idea_id": "idea_123",
  "scores": {
    "market": 72,
    "build": 68,
    "edge": 75,
    "money": 61
  },
  "rationales": {
    "market": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "build": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "edge": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    },
    "money": {
      "reason": "점수 근거",
      "counterargument": "반론",
      "verification_needed": "핵심 가정"
    }
  },
  "ethics": {
    "flag": false,
    "note": ""
  },
  "total_score": 69,
  "next_steps": ["확인 필요 항목 우선 리서치"]
}
```

---

## 4. Notion 데이터 모델

### 4.1 Ideas

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `id` | ID | 고유 식별자 |
| `title` | Title | 아이디어 제목 |
| `summary` | Text | 한 줄 요약 |
| `keywords_used` | Multi-select | 사용된 키워드 리스트 |
| `generation_mode` | Select | Full Match / Forced Pairing / Serendipity |
| `status` | Select | 신규 / 관심 / 검토 중 / 실행 / 보류 / 폐기 |
| `bookmarked` | Checkbox | 북마크 여부 |
| `created_date` | Date | 생성일 |
| `last_reviewed` | Date | 마지막 상태 변경일 |
| `stale_flag` | Checkbox | 14일 이상 방치 시 자동 체크 |
| `deep_report` | Relation | Deep Report 페이지 링크 |
| `evaluation` | Relation | 평가 결과 페이지 링크 |
| `generation_run` | Relation | 생성에 사용된 AI Run |
| `total_score` | Number | 종합 점수 |

### 4.2 Evaluations

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `idea` | Relation | 연결된 아이디어 |
| `market_score` | Number | 시장성 점수 |
| `market_rationale` | Text | 근거 + 반론 + 확인 필요 |
| `build_score` | Number | 실행 가능성 점수 |
| `build_rationale` | Text | 근거 + 반론 + 확인 필요 |
| `edge_score` | Number | 독창성 점수 |
| `edge_rationale` | Text | 근거 + 반론 + 확인 필요 |
| `money_score` | Number | 수익성 점수 |
| `money_rationale` | Text | 근거 + 반론 + 확인 필요 |
| `ethics_flag` | Checkbox | 윤리 리스크 플래그 |
| `ethics_note` | Text | 윤리 리스크 상세 |
| `total_score` | Formula | 가중 합계 |
| `next_steps` | Text | 점수 구간별 제안 액션 |
| `evaluation_run` | Relation | 평가에 사용된 AI Run |
| `evaluated_date` | Date | 평가일 |

### 4.3 Session Logs

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `session_date` | Date | 세션 날짜 |
| `session_type` | Select | 발산 / 수렴 |
| `keywords_selected` | Multi-select | 선택한 키워드 |
| `generation_mode` | Select | 사용한 생성 모드 |
| `ideas_generated` | Number | 생성된 아이디어 수 |
| `ideas_bookmarked` | Relation | 북마크된 아이디어 |
| `ideas_discarded` | Relation | 비선택 아이디어 |
| `session_duration` | Number | 소요 시간(분) |

### 4.4 AI Runs

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `run_id` | Title | 실행 고유 ID |
| `run_type` | Select | idea_generation / deep_report / evaluation |
| `prompt_version` | Text | 프롬프트 버전 |
| `model` | Text | 사용 모델명 |
| `input_tokens` | Number | 입력 토큰 수 |
| `output_tokens` | Number | 출력 토큰 수 |
| `latency_ms` | Number | 응답 시간 |
| `validation_status` | Select | passed / failed / warning |
| `save_status` | Select | pending / saved / failed |
| `retry_count` | Number | 저장 또는 실행 재시도 횟수 |
| `error_message` | Text | 실패 시 에러 메시지 |
| `created_date` | Date | 실행 시각 |

### 4.5 Keywords

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `keyword` | Title | 키워드명 |
| `category` | Select | Who / Domain / Tech / Value / Money |
| `source` | Select | fixed / custom / dynamic(V2) |
| `added_date` | Date | 추가일 |
| `used_count` | Number | 사용 횟수 |
| `last_used` | Date | 마지막 사용일 |

---

## 5. 프롬프트 설계 원칙

### 5.1 아이디어 생성 프롬프트

- 키워드 조합을 "제약"이 아니라 "영감의 씨앗"으로 해석하도록 지시
- 10개 아이디어가 서로 다른 접근 방식을 취하도록 강제
- 이전 생성 아이디어 제목을 컨텍스트에 포함해 중복을 줄임
- 각 아이디어는 `제목 + 한 줄 요약` 형식을 유지

### 5.2 평가 프롬프트

- 반드시 `근거 + 반론 + 확인 필요` 3중 구조를 출력하도록 강제
- 확신할 수 없는 부분은 점수 왜곡보다 `확인 필요`에 명시하도록 지시
- 평가 시 해당 아이디어의 PRD를 컨텍스트에 포함
- 점수 인플레이션 방지를 위해 `60점이 평균` 기준선을 명시

### 5.3 프롬프트 버전 관리와 검증

- 모든 응답은 `prompt_version`과 `run_type`를 payload에 포함한다.
- 아이디어 생성, PRD, 평가는 각각 독립된 prompt template을 사용한다.
- Notion 저장 전 JSON schema 검증을 통과해야 하며, 실패 시 저장하지 않는다.
- 검증 실패 시 1회는 same-input 재시도, 이후에는 `validation_status=failed`로 종료한다.
- 평가 프롬프트에는 2개 이상의 few-shot 예시를 두어 점수 인플레이션과 과도한 낙관 편향을 줄인다.

---

## 6. 문서 간 참조

- 제품 정의와 단계별 범위는 [01_Project_Overview.md](./01_Project_Overview.md)를 따른다.
- 생성 모드와 아이디어 생명주기 정책은 [02_Idea_System_Spec.md](./02_Idea_System_Spec.md)를 따른다.
- 운영 루틴과 비용/지표는 [04_Operations_Handbook.md](./04_Operations_Handbook.md)를 따른다.
