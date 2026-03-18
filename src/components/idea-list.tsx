"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_100px_60px_80px_100px] gap-4 px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wide">
        <span>제목</span>
        <span>상태</span>
        <span>점수</span>
        <span className="text-center">북마크</span>
        <span>생성일</span>
      </div>

      {/* Rows */}
      {ideas.map((idea) => (
        <div
          key={idea.id}
          onClick={() => router.push(`/ideas/${idea.id}`)}
          className="grid grid-cols-[1fr_100px_60px_80px_100px] gap-4 items-center bg-surface rounded-card shadow-marshmallow p-4 cursor-pointer transition-all duration-300 hover:shadow-marshmallow-hover hover:-translate-y-0.5"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(idea.id, !idea.bookmarked);
              }}
              className="text-text-muted hover:text-primary transition-colors"
            >
              {idea.bookmarked ? (
                <BookmarkCheck className="size-4 text-primary fill-primary/20" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </button>
          </div>

          <span className="text-xs text-text-muted">
            {formatDate(idea.created_at)}
          </span>
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

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  // Firestore timestamps come as { _seconds, _nanoseconds } or ISO string
  const raw = ts as { _seconds?: number } | string;
  if (typeof raw === "string") return new Date(raw).toLocaleDateString("ko-KR");
  if (typeof raw === "object" && raw._seconds) {
    return new Date(raw._seconds * 1000).toLocaleDateString("ko-KR");
  }
  return "—";
}
