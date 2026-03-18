import type { Keyword, KeywordCategory } from "@/types";
import { CATEGORY_ORDER } from "@/lib/constants";

/** 카테고리별 1개씩 랜덤 추출하여 5개짜리 조합 생성 */
function pickOnePerCategory(
  grouped: Record<KeywordCategory, Keyword[]>,
): Keyword[] {
  return CATEGORY_ORDER.map((cat) => {
    const pool = grouped[cat];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }).filter((k): k is Keyword => k !== null);
}

/** 중복 없는 N개 조합 생성 */
export function generateCombos(
  keywords: Keyword[],
  count: number = 3,
): Keyword[][] {
  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = keywords.filter((k) => k.category === cat);
      return acc;
    },
    {} as Record<KeywordCategory, Keyword[]>,
  );

  const combos: Keyword[][] = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (combos.length < count && attempts < 50) {
    attempts++;
    const combo = pickOnePerCategory(grouped);
    const key = combo.map((k) => k.id).sort().join(",");
    if (!seen.has(key)) {
      seen.add(key);
      combos.push(combo);
    }
  }

  return combos;
}
