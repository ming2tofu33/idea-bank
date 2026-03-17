---
title: Backend API
tags:
  - architecture
  - api
---

# Backend API

> Next.js API Routes 기반 백엔드의 엔드포인트 목록, 요청/응답 형식, 에러 처리, 인증 전략을 정의한다.

---

## 1. API Routes 목록

| Method | Endpoint | 역할 |
|---|---|---|
| `POST` | `/api/generate` | 키워드 조합으로 아이디어 10개 생성 (OpenAI 호출) |
| `GET` | `/api/ideas` | 아이디어 목록 조회 (필터, 정렬, 페이지네이션) |
| `POST` | `/api/ideas` | 아이디어 수동 저장 |
| `GET` | `/api/ideas/[id]` | 아이디어 상세 조회 |
| `PATCH` | `/api/ideas/[id]` | 아이디어 상태 변경, 북마크 토글 |
| `POST` | `/api/report` | Deep Report(PRD) 생성 (GPT-4o 호출) |
| `POST` | `/api/evaluate` | 비즈니스 평가 실행 (GPT-4o 호출) |
| `GET` | `/api/keywords` | 키워드 풀 조회 |
| `POST` | `/api/keywords` | 커스텀 키워드 추가 |
| `DELETE` | `/api/keywords/[id]` | 커스텀 키워드 삭제 |
| `GET` | `/api/sessions` | 세션 로그 조회 |

---

## 2. 요청/응답 형식 요약

### POST /api/generate

**Request:**

```json
{
  "keywords": ["Z세대", "핀테크", "LLM 에이전트"],
  "mode": "full_match"
}
```

**Response:**

```json
{
  "run_type": "idea_generation",
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

### PATCH /api/ideas/[id]

**Request:**

```json
{
  "status": "interested",
  "bookmarked": true
}
```

---

## 3. 에러 응답 형식

> [!warning]
> 모든 API 에러는 아래 ==통일된 형식==으로 반환한다.

```json
{
  "error": true,
  "code": "GENERATION_FAILED",
  "message": "OpenAI API 호출 실패",
  "details": "Rate limit exceeded"
}
```

---

## 4. 인증/보안

> [!note]
> V1은 개인용이므로 ==최소한의 보안==만 적용한다. V2에서 필요 시 Firebase Auth 도입 검토.

- API 키는 서버 사이드(`.env.local`)에서만 관리
- OpenAI API 키, Firebase 설정은 클라이언트에 노출하지 않음

---

## Related

- [[System-Architecture]] — 전체 시스템 구성도와 실행 경계
- [[AI-Pipeline]] — OpenAI 호출 파이프라인과 에러 처리 상세

## See Also

- [[Database-Schema]] — API가 읽고 쓰는 Firestore 컬렉션 구조 (02-Architecture)
- [[Evaluation-Matrix]] — 평가 매트릭스 기능 명세 (03-Features)
