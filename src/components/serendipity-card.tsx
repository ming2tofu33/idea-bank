"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { generateCombos } from "@/lib/serendipity";
import { useFetch } from "@/hooks/use-fetch";
import { fetchKeywords } from "@/lib/api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Dices, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Keyword } from "@/types";

interface SerendipityCardProps {
  /** 조합 클릭 시 콜백 — 키워드 배열 전달 */
  onSelect: (keywords: Keyword[]) => void;
}

export function SerendipityCard({ onSelect }: SerendipityCardProps) {
  const { data, loading } = useFetch(() => fetchKeywords());
  const [seed, setSeed] = useState(0);

  const combos = useMemo(() => {
    if (!data?.keywords) return [];
    return generateCombos(data.keywords, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, seed]);

  const reshuffle = () => setSeed((s) => s + 1);

  if (loading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton variant="card" className="h-24" count={3} />
      </div>
    );
  }

  if (combos.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dices className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-text-main">오늘의 추천 조합</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reshuffle}>
          <RefreshCw className="size-3.5" />
          <span>다시 섞기</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {combos.map((combo, i) => (
          <button
            key={`${seed}-${i}`}
            onClick={() => onSelect(combo)}
            aria-label={`추천 조합 ${i + 1}: ${combo.map((k) => k.keyword).join(", ")}`}
            className="group bg-surface rounded-card-lg shadow-marshmallow border border-white/80 p-5 text-left transition-all duration-300 hover:shadow-marshmallow-hover hover:-translate-y-1 cursor-pointer"
          >
            {/* Combo pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {combo.map((kw) => {
                const colors = CATEGORY_COLORS[kw.category];
                return (
                  <span
                    key={kw.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      colors.bg,
                      colors.text,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", colors.dot)} />
                    {kw.keyword}
                  </span>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="size-3.5" />
              <span>이 조합으로 생성</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
