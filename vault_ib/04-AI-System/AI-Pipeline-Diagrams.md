---
title: AI Pipeline Diagrams
tags:
  - ai-system
  - pipeline
  - diagrams
---

# AI Pipeline Diagrams

> Idea Bank의 3가지 AI 파이프라인(생성, Deep Report, 평가)의 전체 흐름을 시각화한다.

---

## 1. 전체 파이프라인 맵

사용자의 하루 세션에서 AI가 개입하는 3가지 지점:

```mermaid
flowchart LR
    subgraph Morning["☀️ 아침 발산 세션"]
        A["키워드 선택"] --> B["생성 파이프라인"]
        B --> C["아이디어 10개"]
        C --> D["북마크 1~2개"]
    end

    subgraph Evening["🌙 저녁 수렴 세션"]
        E["북마크 아이디어 선택"] --> F["보고서 파이프라인"]
        F --> G["Deep Report (PRD)"]
        G --> H["평가 파이프라인"]
        H --> I["평가 결과 + Next Step"]
    end

    D -.->|"Firestore 저장"| E

    style Morning fill:#1e3a5f,stroke:#4a90d9,color:#fff
    style Evening fill:#3a1e5f,stroke:#9a4ad9,color:#fff
```

---

## 2. 생성 파이프라인 (아이디어 생성)

> ==o4-mini== 사용 — 매일 아침 발산 세션

```mermaid
flowchart TD
    Start(["사용자: 키워드 선택 + 모드 선택"]) --> API["POST /api/generate"]

    API --> V1["입력 검증"]
    V1 -->|"실패"| Err1["400 Bad Request 반환"]
    V1 -->|"통과"| Dup["최근 30일 아이디어 제목 조회"]

    Dup --> Build["프롬프트 조립"]
    Build --> |"시스템 프롬프트\n+ 키워드\n+ 모드 규칙\n+ 제외 제목"| LLM

    subgraph LLM["OpenAI o4-mini 호출"]
        Call["API 호출"]
        Call -->|"타임아웃"| Retry1["1회 재시도"]
        Retry1 -->|"실패"| ErrLLM["에러 반환"]
        Call -->|"성공"| Raw["Raw JSON 응답"]
    end

    Raw --> Parse["JSON 파싱"]
    Parse -->|"실패"| RetryParse["same-input 1회 재시도"]
    RetryParse -->|"실패"| ErrValidation["validation_status: failed"]
    Parse -->|"성공"| Schema["스키마 검증\n(10개 아이디어, 필수 필드)"]

    Schema -->|"실패"| RetrySchema["same-input 1회 재시도"]
    RetrySchema -->|"실패"| ErrValidation
    Schema -->|"통과"| DupCheck["중복 체크\n(기존 제목과 비교)"]

    DupCheck -->|"중복 발견"| FlagDup["duplicate_warning: true"]
    DupCheck -->|"중복 없음"| Clean["정상 저장"]
    FlagDup --> Save

    Clean --> Save["Firestore 저장"]

    subgraph Save["Firestore 저장"]
        S1["ideas 컬렉션 × 10개"]
        S1 -->|"실패"| RetryS["최대 3회 재시도"]
        RetryS -->|"실패"| ErrSave["save_status: failed"]
        S1 -->|"성공"| S2["sessions 컬렉션 로그"]
        S2 --> S3["ai_runs 로그 기록"]
    end

    S3 --> Response(["프론트엔드에 결과 반환\n아이디어 10개 + 상태"])

    style LLM fill:#2d4a22,stroke:#5a9a3d,color:#fff
    style Save fill:#4a3a22,stroke:#9a7a3d,color:#fff
```

---

## 3. 보고서 파이프라인 (Deep Report)

> ==GPT-4o== 사용 — 저녁 수렴 세션

```mermaid
flowchart TD
    Start(["사용자: 아이디어 선택 → Deep Report 요청"]) --> API["POST /api/report"]

    API --> Fetch["Firestore에서 아이디어 조회"]
    Fetch -->|"없음"| Err404["404 Not Found"]
    Fetch -->|"존재"| Build["프롬프트 조립"]

    Build -->|"시스템 프롬프트\n+ 제목/요약/키워드\n+ 9개 섹션 규칙"| LLM

    subgraph LLM["OpenAI GPT-4o 호출"]
        Call["API 호출"]
        Call -->|"타임아웃"| Retry1["1회 재시도"]
        Retry1 -->|"실패"| ErrLLM["에러 반환"]
        Call -->|"성공"| Raw["Raw JSON 응답"]
    end

    Raw --> Parse["JSON 파싱 + 스키마 검증"]
    Parse -->|"실패"| RetryParse["same-input 1회 재시도"]
    RetryParse -->|"실패"| ErrValidation["validation_status: failed"]
    Parse -->|"통과"| Validate["9개 섹션 완전성 체크"]

    Validate --> Save["Firestore 저장"]

    subgraph Save["Firestore 저장"]
        S1["evaluations 컬렉션에 PRD 저장"]
        S1 --> S2["ideas 문서에 deep_report_id 연결"]
        S2 --> S3["ideas.status → reviewing 전환"]
        S3 --> S4["ai_runs 로그 기록"]
    end

    S4 --> Response(["프론트엔드에 PRD 반환\n9개 섹션 구조화"])

    style LLM fill:#2d4a22,stroke:#5a9a3d,color:#fff
    style Save fill:#4a3a22,stroke:#9a7a3d,color:#fff
```

---

## 4. 평가 파이프라인 (비즈니스 평가)

> ==GPT-4o== 사용 — Deep Report 생성 직후

```mermaid
flowchart TD
    Start(["사용자: 평가 실행 요청"]) --> API["POST /api/evaluate"]

    API --> Fetch["Firestore에서\n아이디어 + Deep Report 조회"]
    Fetch -->|"PRD 없음"| Err["Deep Report 먼저 생성 필요"]
    Fetch -->|"존재"| Build["프롬프트 조립"]

    Build -->|"시스템 프롬프트\n+ PRD 전문\n+ 가중치 규칙\n+ few-shot 2개"| LLM

    subgraph LLM["OpenAI GPT-4o 호출"]
        Call["API 호출"]
        Call -->|"타임아웃"| Retry1["1회 재시도"]
        Retry1 -->|"실패"| ErrLLM["에러 반환"]
        Call -->|"성공"| Raw["Raw JSON 응답"]
    end

    Raw --> Parse["JSON 파싱 + 스키마 검증"]
    Parse -->|"실패"| RetryParse["same-input 1회 재시도"]
    RetryParse -->|"실패"| ErrValidation["validation_status: failed"]
    Parse -->|"통과"| Score["총점 계산"]

    Score --> ScoreCalc["total = market×0.30\n+ build×0.25\n+ edge×0.25\n+ money×0.20"]

    ScoreCalc --> Save["Firestore 저장"]

    subgraph Save["Firestore 저장"]
        S1["evaluations 컬렉션에 평가 저장"]
        S1 --> S2["ideas에 evaluation_id, total_score 연결"]
        S2 --> S3["ai_runs 로그 기록"]
    end

    S3 --> Transition{"total_score?"}

    Transition -->|"80+"| T1["reviewing 유지\n+ 실행 후보 태그"]
    Transition -->|"60~79"| T2["reviewing 유지\n+ 추가 리서치 태그"]
    Transition -->|"< 60"| T3["→ on_hold"]

    T1 --> NextStep["Next Step 제안 반환"]
    T2 --> NextStep
    T3 --> NextStep

    NextStep --> Response(["프론트엔드에 평가 결과 반환\n4개 항목 × 3중 구조 + Next Step"])

    style LLM fill:#2d4a22,stroke:#5a9a3d,color:#fff
    style Save fill:#4a3a22,stroke:#9a7a3d,color:#fff
```

---

## 5. 파이프라인 간 데이터 흐름

아이디어 하나가 전체 파이프라인을 거치는 과정:

```mermaid
flowchart LR
    subgraph Gen["생성 파이프라인"]
        G1["키워드 조합"] --> G2["o4-mini"]
        G2 --> G3["아이디어 10개"]
    end

    subgraph Book["사용자 판단"]
        B1["10개 중 1~2개 북마크"]
    end

    subgraph Report["보고서 파이프라인"]
        R1["북마크 아이디어"] --> R2["GPT-4o"]
        R2 --> R3["9개 섹션 PRD"]
    end

    subgraph Eval["평가 파이프라인"]
        E1["PRD 전문"] --> E2["GPT-4o\n+ few-shot"]
        E2 --> E3["4개 항목 평가\n+ total_score"]
    end

    subgraph Action["상태 전이"]
        A1{"점수?"}
        A1 -->|"80+"| A2["실행 후보"]
        A1 -->|"60~79"| A3["추가 리서치"]
        A1 -->|"< 60"| A4["보류"]
    end

    Gen --> Book --> Report --> Eval --> Action

    style Gen fill:#1a3a2a,stroke:#3a8a5a,color:#fff
    style Report fill:#1a2a3a,stroke:#3a5a8a,color:#fff
    style Eval fill:#3a1a2a,stroke:#8a3a5a,color:#fff
```

---

## 6. 에러 처리 요약

```mermaid
flowchart LR
    subgraph Errors["에러 발생 지점"]
        E1["OpenAI 타임아웃"]
        E2["JSON 파싱 실패"]
        E3["스키마 검증 실패"]
        E4["Firestore 저장 실패"]
        E5["Rate Limit"]
    end

    E1 -->|"1회 재시도"| R1{"성공?"}
    E2 -->|"1회 재시도"| R2{"성공?"}
    E3 -->|"1회 재시도"| R3{"성공?"}
    E4 -->|"3회 재시도"| R4{"성공?"}
    E5 -->|"재시도 안함"| F5["사용자에게 안내"]

    R1 -->|"N"| F1["에러 반환"]
    R2 -->|"N"| F2["validation_status: failed"]
    R3 -->|"N"| F3["validation_status: failed"]
    R4 -->|"N"| F4["save_status: failed"]

    R1 -->|"Y"| OK["정상 진행"]
    R2 -->|"Y"| OK
    R3 -->|"Y"| OK
    R4 -->|"Y"| OK
```

> [!important]
> 모든 에러는 ==ai_runs 컬렉션==에 기록된다. `error_message`, `retry_count`, `validation_status`, `save_status` 필드로 추적.

---

## 7. 비용 흐름

```mermaid
flowchart TD
    subgraph Daily["매일"]
        D1["발산 세션 1회"] -->|"o4-mini\n~4K tokens"| Cost1["~$0.15~0.25/일"]
    end

    subgraph Weekly["주 2회"]
        W1["Deep Report"] -->|"GPT-4o\n~7K tokens"| Cost2["~$0.5~1.0/회"]
        W2["비즈니스 평가"] -->|"GPT-4o\n~6K tokens"| Cost3["~$0.5~0.75/회"]
    end

    Cost1 --> Monthly["월간 합계\n==~$7~12=="]
    Cost2 --> Monthly
    Cost3 --> Monthly

    Monthly --> Cap{"$30 상한"}
    Cap -->|"80% 도달"| Warning["⚠️ 경고 표시"]
    Cap -->|"초과"| Block["🚫 API 호출 차단"]
```

---

## Related

- [[Prompts-Overview]] — 프롬프트 설계 원칙과 버전 관리
- [[Response-Contracts]] — 각 파이프라인의 JSON 응답 계약
- [[Prompt-Generation]] — 생성 프롬프트 상세
- [[Prompt-Evaluation]] — 평가 프롬프트 상세 (few-shot 포함)

## See Also

- [[AI-Pipeline]] — 파이프라인 아키텍처 텍스트 문서 (02-Architecture)
- [[Idea-Lifecycle]] — 평가 결과에 따른 상태 전이 규칙 (03-Features)
