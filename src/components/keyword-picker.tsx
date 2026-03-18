"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/constants";
import { useFetch } from "@/hooks/use-fetch";
import { fetchKeywords } from "@/lib/api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Check, Plus } from "lucide-react";
import type { Keyword } from "@/types";

interface KeywordPickerProps {
  selectedKeywords: Keyword[];
  onToggle: (keyword: Keyword) => void;
}

export function KeywordPicker({ selectedKeywords, onToggle }: KeywordPickerProps) {
  const { data, loading, error } = useFetch(() => fetchKeywords());

  if (loading) {
    return (
      <div className="space-y-8 py-8">
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="space-y-4">
            <LoadingSkeleton variant="line" className="w-32 mx-auto" />
            <div className="flex flex-wrap justify-center gap-3">
              <LoadingSkeleton variant="pill" count={6} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        키워드를 불러오지 못했습니다: {error}
      </div>
    );
  }

  const keywords = data?.keywords ?? [];
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: keywords.filter((k) => k.category === cat),
  }));

  const selectedIds = new Set(selectedKeywords.map((k) => k.id));

  return (
    <div className="space-y-12 py-8">
      {grouped.map(({ category, items }) => {
        const colors = CATEGORY_COLORS[category];
        return (
          <section key={category} className="space-y-5">
            {/* Category divider */}
            <div className="flex items-center gap-4 px-2">
              <div
                className={cn(
                  "h-px flex-1 bg-gradient-to-r from-transparent to-transparent opacity-30",
                  `via-${colors.dot.replace("bg-", "")}`,
                )}
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${getCategoryColor(category)}, transparent)`,
                }}
              />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted/60">
                {CATEGORY_LABELS[category]}
              </h2>
              <div
                className="h-px flex-1 opacity-30"
                style={{
                  backgroundImage: `linear-gradient(to right, ${getCategoryColor(category)}, transparent)`,
                }}
              />
            </div>

            {/* Keyword pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((keyword) => {
                const isSelected = selectedIds.has(keyword.id);
                return (
                  <button
                    key={keyword.id}
                    onClick={() => onToggle(keyword)}
                    className={cn(
                      "floating-bubble flex items-center gap-2.5 rounded-full px-6 py-3 border text-sm font-semibold transition-all",
                      isSelected
                        ? cn(
                            "shadow-marshmallow-inset",
                            colors.bg,
                            colors.text,
                            "border-transparent",
                          )
                        : "bg-surface shadow-marshmallow border-white/60 text-text-main hover:shadow-marshmallow-hover",
                    )}
                  >
                    <span className={cn("size-2.5 rounded-full", colors.dot)} />
                    <span>{keyword.keyword}</span>
                    {isSelected ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Plus className="size-3.5 text-text-muted opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    who: "#FFB7B2",
    domain: "#B5EAD7",
    tech: "#E2F0CB",
    value: "#F3E8FF",
    money: "#136aec33",
  };
  return map[category] ?? "#E6E1D6";
}
