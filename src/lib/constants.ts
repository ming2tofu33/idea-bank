import type { KeywordCategory, IdeaStatus, GenerationMode } from "@/types";

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
  "reviewing",
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
