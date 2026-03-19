"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, KEYWORD_SUGGESTIONS } from "@/lib/constants";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Keyword, KeywordCategory } from "@/types";

interface KeywordSuggestionsProps {
  /** 이미 보유한 키워드 목록 — 중복 제외에 사용 */
  existingKeywords: Keyword[];
  /** 추천 키워드 클릭 시 콜백 */
  onAdd: (keyword: string, category: KeywordCategory) => Promise<void>;
}

const SHOW_COUNT = 12;

export function KeywordSuggestions({ existingKeywords, onAdd }: KeywordSuggestionsProps) {
  const [seed, setSeed] = useState(0);
  const [addingKey, setAddingKey] = useState<string | null>(null);

  // 이미 보유한 키워드 텍스트+카테고리 세트
  const existingSet = useMemo(
    () => new Set(existingKeywords.map((k) => `${k.category}:${k.keyword}`)),
    [existingKeywords],
  );

  // 보유하지 않은 것만 필터 → 랜덤 SHOW_COUNT개
  const suggestions = useMemo(() => {
    const pool = KEYWORD_SUGGESTIONS.filter(
      (s) => !existingSet.has(`${s.category}:${s.keyword}`),
    );
    // seed 기반 셔플 (Fisher-Yates)
    const shuffled = [...pool];
    let i = shuffled.length;
    // seed를 활용한 간단한 의사난수
    let rand = seed * 9301 + 49297;
    while (i > 0) {
      rand = (rand * 9301 + 49297) % 233280;
      const j = Math.floor((rand / 233280) * i--);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, SHOW_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingSet, seed]);

  const handleAdd = async (keyword: string, category: KeywordCategory) => {
    const key = `${category}:${keyword}`;
    setAddingKey(key);
    try {
      await onAdd(keyword, category);
    } finally {
      setAddingKey(null);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-surface rounded-card-lg shadow-marshmallow p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-text-main">추천 키워드</h2>
          <p className="text-xs text-text-muted mt-0.5">
            아직 없는 키워드예요. 클릭하면 바로 추가돼요.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSeed((s) => s + 1)}
          className="text-text-muted"
        >
          <RefreshCw className="size-3.5" />
          <span>새로 보기</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const key = `${s.category}:${s.keyword}`;
          const colors = CATEGORY_COLORS[s.category];
          const isAdding = addingKey === key;
          return (
            <button
              key={key}
              onClick={() => handleAdd(s.keyword, s.category)}
              disabled={isAdding}
              className={cn(
                "group flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-sm font-medium transition-all",
                "border-border text-text-main",
                "hover:brightness-110 hover:border-border/60",
                colors.bg,
                isAdding && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className={cn("size-2 rounded-full shrink-0", colors.dot)} />
              <span>{s.keyword}</span>
              <Plus
                className={cn(
                  "size-3.5 transition-transform",
                  isAdding ? "animate-spin" : "group-hover:scale-125",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
