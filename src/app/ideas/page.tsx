"use client";

import { useState } from "react";
import { IdeaKanban } from "@/components/idea-kanban";
import { IdeaList } from "@/components/idea-list";
import { useFetch } from "@/hooks/use-fetch";
import { fetchIdeas, patchIdea } from "@/lib/api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, AlertCircle } from "lucide-react";
import type { IdeaStatus } from "@/types";

type ViewMode = "kanban" | "list";

export default function IdeasPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { data, loading, error, refetch } = useFetch(() => fetchIdeas());

  const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
    try {
      await patchIdea(id, { status: newStatus });
      refetch();
    } catch {
      // Fail silently — user can retry
    }
  };

  const handleBookmarkToggle = async (id: string, bookmarked: boolean) => {
    try {
      await patchIdea(id, { bookmarked });
      refetch();
    } catch {
      // Fail silently
    }
  };

  const ideas = data?.ideas ?? [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">아이디어</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "불러오는 중..." : `아이디어 ${ideas.length}개`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("kanban")}
            aria-label="칸반 보기"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
            aria-label="리스트 보기"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      ) : viewMode === "kanban" ? (
        <IdeaKanban
          ideas={ideas}
          onStatusChange={handleStatusChange}
          onBookmarkToggle={handleBookmarkToggle}
        />
      ) : (
        <IdeaList
          ideas={ideas}
          onStatusChange={handleStatusChange}
          onBookmarkToggle={handleBookmarkToggle}
        />
      )}
    </div>
  );
}
