# Idea Bank

매일 아침 5분, 키워드 조합 기반 비즈니스 아이디어 발산 + 평가 + 축적 웹앱. Solo 프로젝트 (Amy).

## Stack

- Frontend: Next.js (App Router) + Tailwind CSS + shadcn/ui + Vercel
- Backend: Next.js API Routes (같은 프로젝트 내 폴더 분리)
- DB: Firebase Firestore
- AI: OpenAI (o4-mini / GPT-4o)

## Phase

현재 Phase → V1 MVP (구현 준비 중). `vault_ib/06-Implementation/V1-MVP-Plan.md` 참조.

## 참조 규칙

- `vault_ib/` = 프로젝트 지식 베이스 (Obsidian vault). 스펙, 설계, 계획, 의사결정 모두 여기.
- `vault_ib/06-Implementation/` = 구현 계획, 스프린트 파일.
- `docs/` = 원본 스펙 (레거시, 읽기 전용). vault로 변환 완료.
- CLAUDE.md는 실행 규칙만. 스펙 내용을 여기에 복제하지 않는다.

## Workflow

0. **계획 먼저.** 사소한 코드 수정(오타, 1줄 변경)을 제외한 모든 작업은 구현 전에 계획을 세운다.
1. 세션 시작 → `vault_ib/` 확인 → 현재 스프린트/계획 파악
2. 태스크 1개만 doing → 구현 → 완료 기준 통과 → done
3. 완료 시 증거 링크 필수
4. 계획 완료 후 → vault 관련 노트 업데이트

## Vault 운영 규칙

- 설계/계획 문서는 `vault_ib/06-Implementation/`에 작성.
- 구현 완료 후 vault 내 변경된 파일/기능명 관련 노트 업데이트.
- Vault 문서 작성 규칙은 `vault_ib/VAULT_RULES.md` 참조.

## 금지 사항

- `docs/` 레거시 스펙 파일은 명시적 요청 없이 수정하지 않는다
- `.env` 파일 커밋 금지 (`.env.example`만 커밋)
- 스프린트 게이트 미충족 시 다음 Phase로 넘어가지 않는다

## Commit

- 기능 단위 커밋. 메시지: `feat:`, `fix:`, `chore:`, `docs:`
- 코드 구현 세션과 리뷰 세션을 분리한다

## Directory

```
src/
  app/         → 라우팅 (페이지 + API Routes 핸들러)
  server/      → 서버 전용 (firebase, openai, prompts, validators)
  components/  → 프론트엔드 컴포넌트
  types/       → 공유 타입 (서버+클라이언트)
  lib/         → 공유 유틸 (utils 등)
vault_ib/      → 프로젝트 지식 베이스 (Obsidian vault). 스펙/설계/계획.
docs/          → 원본 스펙 (레거시, 읽기 전용)
```
