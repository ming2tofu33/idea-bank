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
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
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
                      "group floating-bubble flex items-center gap-2.5 rounded-full px-6 py-3 border text-sm font-semibold transition-all",
                      isSelected
                        ? cn(colors.bg, colors.text, "border-border/40")
                        : "bg-surface border-border text-text-main hover:bg-muted hover:border-border/70",
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
    who: "rgba(255,183,178,0.25)",
    domain: "rgba(181,234,215,0.25)",
    tech: "rgba(226,240,203,0.25)",
    value: "rgba(243,232,255,0.25)",
    money: "rgba(19,106,236,0.2)",
  };
  return map[category] ?? "rgba(200,200,200,0.15)";
}
