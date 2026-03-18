"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { Bookmark, BookmarkCheck, AlertTriangle } from "lucide-react";
import type { KeywordCategory, IdeaStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface IdeaCardProps {
  idea: {
    id: string;
    rank?: number;
    title: string;
    summary: string;
    target_user?: string;
    problem?: string;
    keywords_used?: string[];
    bookmarked: boolean;
    total_score?: number | null;
    status?: IdeaStatus;
    duplicate_warning?: boolean;
  };
  onBookmarkToggle?: (id: string, bookmarked: boolean) => void;
  compact?: boolean;
}

export function IdeaCard({ idea, onBookmarkToggle, compact }: IdeaCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/ideas/${idea.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(idea.id, !idea.bookmarked);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-surface rounded-card-lg shadow-marshmallow border border-white/80 cursor-pointer transition-all duration-300 hover:shadow-marshmallow-hover hover:-translate-y-0.5",
        compact ? "p-4" : "p-6",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {idea.rank != null && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {idea.rank}
            </span>
          )}
          <h3
            className={cn(
              "font-bold text-text-main truncate",
              compact ? "text-sm" : "text-lg",
            )}
          >
            {idea.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {idea.total_score != null && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                idea.total_score >= 80
                  ? "bg-score-high-bg text-score-high-text"
                  : idea.total_score >= 60
                    ? "bg-score-mid-bg text-score-mid-text"
                    : "bg-score-low-bg text-score-low-text",
              )}
            >
              {idea.total_score}점
            </span>
          )}
          {idea.duplicate_warning && (
            <AlertTriangle className="size-4 text-amber-500" />
          )}
          <button
            onClick={handleBookmark}
            aria-label={idea.bookmarked ? "북마크 해제" : "북마크"}
            aria-pressed={idea.bookmarked}
            className="min-w-10 min-h-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors rounded-full hover:bg-muted/50"
          >
            {idea.bookmarked ? (
              <BookmarkCheck className="size-5 text-primary fill-primary/20" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <p
        className={cn(
          "text-text-muted mt-2",
          compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3",
        )}
      >
        {idea.summary}
      </p>

      {/* Status badge (compact mode) */}
      {compact && idea.status && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {STATUS_LABELS[idea.status]}
          </Badge>
        </div>
      )}

      {/* Footer: target user + keywords (full mode) */}
      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {idea.target_user && (
            <span className="text-xs text-text-muted bg-muted rounded-full px-2.5 py-1">
              {idea.target_user}
            </span>
          )}
          {idea.keywords_used?.slice(0, 3).map((kw) => (
            <CategoryBadge
              key={kw}
              category={guessCategoryFromKeyword(kw)}
              label={kw}
              className="text-xs"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Best-effort category guess for display purposes. Defaults to "domain". */
function guessCategoryFromKeyword(_keyword: string): KeywordCategory {
  return "domain";
}
