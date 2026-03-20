"use client";

import { cn } from "@/lib/utils";
import type { BlueprintListItem } from "@/types";

interface BlueprintCardProps {
  blueprint: BlueprintListItem;
  onClick: () => void;
}

function scoreStyle(score: number | null) {
  if (score == null) return null;
  if (score >= 80)
    return {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    };
  if (score >= 60)
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    };
  return {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function BlueprintCard({ blueprint, onClick }: BlueprintCardProps) {
  const score = scoreStyle(blueprint.total_score);
  const visibleKeywords = blueprint.idea_keywords.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-surface rounded-card-lg shadow-marshmallow border border-border p-4 transition-all duration-300 hover:shadow-marshmallow-hover hover:-translate-y-0.5 cursor-pointer"
    >
      {/* 제목 */}
      <div className="font-bold text-sm text-text-main mb-2 leading-snug line-clamp-2">
        {blueprint.idea_title}
      </div>

      {/* 핵심 문제 */}
      <div className="text-xs text-text-muted mb-3 leading-snug line-clamp-2">
        {blueprint.idea_problem}
      </div>

      {/* 키워드 뱃지 (최대 3개) */}
      {visibleKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* 하단: 점수 + 날짜 */}
      <div className="flex items-center justify-between mt-auto">
        {score && blueprint.total_score != null ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
              score.bg,
              score.text,
            )}
          >
            {blueprint.total_score}점
          </span>
        ) : (
          <span className="text-xs text-text-muted">평가 없음</span>
        )}
        <span className="text-[10px] text-text-muted">
          {formatDate(blueprint.created_at)}
        </span>
      </div>
    </button>
  );
}
