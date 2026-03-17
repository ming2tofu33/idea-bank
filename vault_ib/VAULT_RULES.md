# VAULT_RULES

> Idea Bank vault 문서 작성 규칙.

---

## 레이어 구조

| 번호 | 레이어 | 용도 |
|------|--------|------|
| 01-Core | 비전, 로드맵, 오디언스 | 프로젝트의 "왜"와 "누구를 위해" |
| 02-Architecture | 시스템 설계, 스택 | 기술 아키텍처, DB 스키마, API |
| 03-Features | 제품 기능 | 키워드, 생성 모드, 평가, 생명주기 |
| 04-AI-System | AI 파이프라인, 프롬프트 | 프롬프트 설계, JSON 계약 |
| 05-Operations | 운영, 배포, 비용 | 세션 플로우, 비용 관리, KPI |
| 06-Implementation | 구현 계획 | V1/V2 계획, 스프린트 |
| 90-Archive | 아카이브 | 폐기/교체된 노트 보관 |
| 99-Reference | 참고 자료 | ADR, API 목록, 키워드 풀 |

---

## 노트 구조 템플릿

```markdown
---
title: 노트 제목
tags:
  - 레이어명
  - 보조 태그
---

# 노트 제목

> 한 줄 요약 또는 메타데이터

---

## 본문 섹션들

(내용)

## Related

- [[Same-Layer-Note]] — 간단 설명

## See Also

- [[Cross-Layer-Note]] — 간단 설명 (레이어명)
```

---

## 링크 규칙

**핵심 원칙:** "같은 레이어 우선, 다른 레이어 최소화"

- **`## Related`** (같은 층): 2~3개 권장, 최대 4개. 같은 폴더에만.
- **`## See Also`** (다른 층): 최대 2개. 레이어명을 괄호로 표기.
- **Body links**: 설명 맥락에서만 사용, 목록으로 나열 금지.

---

## 파일 명명 규칙

| 유형 | 형식 | 예시 |
|------|------|------|
| 지식 노트 | `Title-Case-Hyphens.md` | `Keyword-System.md` |
| Plan 파일 | `YYYY-MM-DD-slug.md` | `2026-03-16-v1-mvp-impl.md` |
| 메타 문서 | `UPPER_CASE.md` | `VAULT_RULES.md` |

---

## 서식 규칙

- **강조**: `==text==` (Obsidian 마커)
- **콜아웃**: `> [!note]`, `> [!important]`, `> [!tip]`, `> [!warning]`
- **다이어그램**: Mermaid (`graph TB`, `graph LR`, `flowchart TD`)
- **코드 블록**: 언어 지정자 필수 (`json`, `bash`, `typescript` 등)
- **체크리스트**: `- [ ]` / `- [x]`

---

## 한/영 혼용 규칙

- UI 요소, 기술 용어는 영어 유지: "API Routes", "Firestore", "shadcn/ui"
- 개념어는 한국어: "파이프라인", "에이전트", "페르소나"
- 원문 강조: `"fire-and-forget" 패턴`
