import type { KeywordCategory, IdeaStatus, GenerationMode } from "@/types";

/** 랜덤 추천용 키워드 풀 — 이미 보유한 키워드는 필터링 후 표시 */
export const KEYWORD_SUGGESTIONS: { keyword: string; category: KeywordCategory }[] = [
  // Who
  { keyword: "1인 개발자", category: "who" },
  { keyword: "프리랜서", category: "who" },
  { keyword: "직장인", category: "who" },
  { keyword: "대학생", category: "who" },
  { keyword: "소상공인", category: "who" },
  { keyword: "육아맘", category: "who" },
  { keyword: "시니어", category: "who" },
  { keyword: "크리에이터", category: "who" },
  { keyword: "MZ세대", category: "who" },
  { keyword: "스타트업 팀", category: "who" },
  { keyword: "마케터", category: "who" },
  { keyword: "디자이너", category: "who" },
  { keyword: "재테크 입문자", category: "who" },
  { keyword: "반려동물 집사", category: "who" },
  { keyword: "독립 아티스트", category: "who" },
  { keyword: "헬스케어 종사자", category: "who" },
  { keyword: "원격 근무자", category: "who" },
  { keyword: "교사", category: "who" },
  // Domain
  { keyword: "교육", category: "domain" },
  { keyword: "헬스케어", category: "domain" },
  { keyword: "부동산", category: "domain" },
  { keyword: "금융", category: "domain" },
  { keyword: "여행", category: "domain" },
  { keyword: "음식", category: "domain" },
  { keyword: "패션", category: "domain" },
  { keyword: "물류", category: "domain" },
  { keyword: "HR", category: "domain" },
  { keyword: "법률", category: "domain" },
  { keyword: "환경", category: "domain" },
  { keyword: "농업", category: "domain" },
  { keyword: "게임", category: "domain" },
  { keyword: "스포츠", category: "domain" },
  { keyword: "뷰티", category: "domain" },
  { keyword: "반려동물", category: "domain" },
  { keyword: "육아", category: "domain" },
  { keyword: "멘탈헬스", category: "domain" },
  // Tech
  { keyword: "AI", category: "tech" },
  { keyword: "블록체인", category: "tech" },
  { keyword: "AR/VR", category: "tech" },
  { keyword: "IoT", category: "tech" },
  { keyword: "클라우드", category: "tech" },
  { keyword: "자동화", category: "tech" },
  { keyword: "음성인식", category: "tech" },
  { keyword: "컴퓨터 비전", category: "tech" },
  { keyword: "노코드", category: "tech" },
  { keyword: "웨어러블", category: "tech" },
  { keyword: "드론", category: "tech" },
  { keyword: "생성AI", category: "tech" },
  { keyword: "데이터 분석", category: "tech" },
  { keyword: "추천 알고리즘", category: "tech" },
  { keyword: "챗봇", category: "tech" },
  { keyword: "로보틱스", category: "tech" },
  // Value
  { keyword: "시간 절약", category: "value" },
  { keyword: "비용 절감", category: "value" },
  { keyword: "개인화", category: "value" },
  { keyword: "커뮤니티", category: "value" },
  { keyword: "투명성", category: "value" },
  { keyword: "지속가능성", category: "value" },
  { keyword: "접근성", category: "value" },
  { keyword: "재미", category: "value" },
  { keyword: "건강", category: "value" },
  { keyword: "생산성", category: "value" },
  { keyword: "연결", category: "value" },
  { keyword: "신뢰", category: "value" },
  { keyword: "프라이버시", category: "value" },
  { keyword: "습관 형성", category: "value" },
  { keyword: "발견", category: "value" },
  // Money
  { keyword: "구독", category: "money" },
  { keyword: "광고", category: "money" },
  { keyword: "수수료", category: "money" },
  { keyword: "프리미엄", category: "money" },
  { keyword: "라이선스", category: "money" },
  { keyword: "크라우드펀딩", category: "money" },
  { keyword: "SaaS", category: "money" },
  { keyword: "B2B", category: "money" },
  { keyword: "마켓플레이스", category: "money" },
  { keyword: "교육 코스", category: "money" },
  { keyword: "제휴 수익", category: "money" },
  { keyword: "데이터 수익화", category: "money" },
];

export const CATEGORY_COLORS: Record<
  KeywordCategory,
  { bg: string; text: string; dot: string }
> = {
  who: {
    bg: "bg-accent-peach/30",
    text: "text-orange-600/70",
    dot: "bg-accent-peach",
  },
  domain: {
    bg: "bg-accent-mint/30",
    text: "text-teal-600/70",
    dot: "bg-accent-mint",
  },
  tech: {
    bg: "bg-accent-lime/40",
    text: "text-lime-700/70",
    dot: "bg-accent-lime",
  },
  value: {
    bg: "bg-accent-purple/30",
    text: "text-purple-600/70",
    dot: "bg-purple-200",
  },
  money: {
    bg: "bg-primary/20",
    text: "text-primary",
    dot: "bg-primary/30",
  },
};

export const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  who: "Who",
  domain: "Domain",
  tech: "Tech",
  value: "Value",
  money: "Money",
};

export const CATEGORY_ORDER: KeywordCategory[] = [
  "who",
  "domain",
  "tech",
  "value",
  "money",
];

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  new: "New",
  interested: "Interested",
  reviewing: "Reviewing",
  executing: "Executing",
  on_hold: "On Hold",
  archived: "Archived",
};

export const STATUS_COLUMNS: IdeaStatus[] = [
  "new",
  "interested",
  "reviewing",
  "executing",
  "on_hold",
  "archived",
];

export const MODE_OPTIONS: {
  value: GenerationMode;
  label: string;
  description: string;
}[] = [
  {
    value: "full_match",
    label: "Full Match",
    description: "선택한 모든 키워드를 반영",
  },
  {
    value: "forced_pairing",
    label: "Forced Pairing",
    description: "의외성 있는 조합을 강제",
  },
  {
    value: "serendipity",
    label: "Serendipity",
    description: "추천 조합으로 자동 생성",
  },
];
