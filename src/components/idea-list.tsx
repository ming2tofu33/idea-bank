"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Idea, IdeaStatus } from "@/types";

interface IdeaListProps {
  ideas: Idea[];
  onStatusChange: (id: string, newStatus: IdeaStatus) => void;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
}

export function IdeaList({
  ideas,
  onBookmarkToggle,
}: IdeaListProps) {
  return (
    <div className="space-y-2">
      {/* Desktop: table header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_60px_80px_100px] gap-4 px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wide">
        <span>제목</span>
        <span>상태</span>
        <span>점수</span>
        <span className="text-center">북마크</span>
        <span>생성일</span>
      </div>

      {ideas.map((idea) => (
        <div key={idea.id}>
          {/* Desktop: table row */}
          <Link
            href={`/ideas/${idea.id}`}
            className="hidden md:grid grid-cols-[1fr_100px_60px_80px_100px] gap-4 items-center bg-surface rounded-card shadow-marshmallow p-4 cursor-pointer transition-all duration-300 hover:shadow-marshmallow-hover hover:-translate-y-0.5"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text-main truncate">
                {idea.title}
              </h3>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {idea.summary}
              </p>
            </div>

            <Badge variant="secondary" className="text-xs w-fit">
              {STATUS_LABELS[idea.status]}
            </Badge>

            <span
              className={cn(
                "text-sm font-bold",
                idea.total_score == null
                  ? "text-text-muted"
                  : idea.total_score >= 80
                    ? "text-score-high-text"
                    : idea.total_score >= 60
                      ? "text-score-mid-text"
                      : "text-score-low-text",
              )}
            >
              {idea.total_score ?? "—"}
            </span>

            <div className="flex justify-center">
              <BookmarkButton
                bookmarked={idea.bookmarked}
                onClick={(e) => {
                  e.preventDefault(); // Link 내부에서 네비게이션 차단
                  onBookmarkToggle(idea.id, !idea.bookmarked);
                }}
              />
            </div>

            <span className="text-xs text-text-muted">
              {formatDate(idea.created_at)}
            </span>
          </Link>

          {/* Mobile: card view */}
          <Link
            href={`/ideas/${idea.id}`}
            className="md:hidden block bg-surface rounded-card-lg shadow-marshmallow p-4 cursor-pointer transition-all duration-300 hover:shadow-marshmallow-hover"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-text-main truncate">
                  {idea.title}
                </h3>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {idea.summary}
                </p>
              </div>
              <BookmarkButton
                bookmarked={idea.bookmarked}
                onClick={(e) => {
                  e.preventDefault(); // Link 내부에서 네비게이션 차단
                  onBookmarkToggle(idea.id, !idea.bookmarked);
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                {STATUS_LABELS[idea.status]}
              </Badge>
              {idea.total_score != null && (
                <span
                  className={cn(
                    "text-xs font-bold",
                    idea.total_score >= 80
                      ? "text-score-high-text"
                      : idea.total_score >= 60
                        ? "text-score-mid-text"
                        : "text-score-low-text",
                  )}
                >
                  {idea.total_score}점
                </span>
              )}
              <span className="text-xs text-text-muted ml-auto">
                {formatDate(idea.created_at)}
              </span>
            </div>
          </Link>
        </div>
      ))}

      {ideas.length === 0 && (
        <div className="bg-surface rounded-card-lg shadow-marshmallow-inset p-12 text-center">
          <p className="text-text-muted">아이디어가 없습니다</p>
        </div>
      )}
    </div>
  );
}

function BookmarkButton({
  bookmarked,
  onClick,
}: {
  bookmarked: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={bookmarked ? "북마크 해제" : "북마크"}
      aria-pressed={bookmarked}
      className="min-w-10 min-h-10 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-muted/50 transition-colors"
    >
      {bookmarked ? (
        <BookmarkCheck className="size-4 text-primary fill-primary/20" />
      ) : (
        <Bookmark className="size-4" />
      )}
    </button>
  );
}

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  const raw = ts as { _seconds?: number } | string;
  if (typeof raw === "string") return new Date(raw).toLocaleDateString("ko-KR");
  if (typeof raw === "object" && raw._seconds) {
    return new Date(raw._seconds * 1000).toLocaleDateString("ko-KR");
  }
  return "—";
}
