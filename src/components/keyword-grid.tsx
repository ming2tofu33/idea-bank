"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/constants";
import { Trash2, Lock } from "lucide-react";
import type { Keyword } from "@/types";

interface KeywordGridProps {
  keywords: Keyword[];
  onDelete?: (id: string) => void;
  deleteLoading?: string | null;
}

export function KeywordGrid({ keywords, onDelete, deleteLoading }: KeywordGridProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: keywords.filter((k) => k.category === cat),
  }));

  return (
    <div className="space-y-10">
      {grouped.map(({ category, items }) => {
        const colors = CATEGORY_COLORS[category];
        return (
          <section key={category} className="space-y-4">
            {/* Category header */}
            <div className="flex items-center gap-3">
              <span className={cn("size-3 rounded-full", colors.dot)} />
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wide">
                {CATEGORY_LABELS[category]}
              </h3>
              <span className="text-xs text-text-muted bg-muted rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-3">
              {items.map((keyword) => {
                const isCustom = keyword.source === "custom";
                const isDeleting = deleteLoading === keyword.id;
                return (
                  <div
                    key={keyword.id}
                    className={cn(
                      "floating-bubble flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold",
                      "bg-surface shadow-marshmallow border-white/60 text-text-main",
                      isDeleting && "opacity-50",
                    )}
                  >
                    <span className={cn("size-2 rounded-full", colors.dot)} />
                    <span>{keyword.keyword}</span>

                    {/* Used count */}
                    {keyword.used_count > 0 && (
                      <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[10px] text-text-muted">
                        {keyword.used_count}
                      </span>
                    )}

                    {/* Delete or lock */}
                    {isCustom ? (
                      <button
                        onClick={() => onDelete?.(keyword.id)}
                        disabled={isDeleting}
                        aria-label={`${keyword.keyword} 삭제`}
                        className="flex min-w-8 min-h-8 items-center justify-center rounded-full hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : (
                      <Lock className="size-3 text-text-muted/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
