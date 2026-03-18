"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { fetchIdeas } from "@/lib/api";
import { IdeaCard } from "@/components/idea-card";
import { patchIdea } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  Sparkles,
  Layers,
  Lightbulb,
  BookmarkCheck,
  Eye,
} from "lucide-react";

export default function DashboardPage() {
  const { data, loading, refetch } = useFetch(() => fetchIdeas());

  const ideas = data?.ideas ?? [];
  const bookmarked = ideas.filter((i) => i.bookmarked);
  const reviewing = ideas.filter((i) => i.status === "reviewing");
  const totalCount = ideas.length;
  const bookmarkedCount = bookmarked.length;
  const reviewingCount = reviewing.length;

  const handleBookmarkToggle = async (id: string, value: boolean) => {
    try {
      await patchIdea(id, { bookmarked: value });
      refetch();
    } catch {
      // Fail silently
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">대시보드</h1>
        <p className="text-text-muted mt-1">오늘도 5분, 아이디어를 발산해보세요</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/generate">
          <div className="bg-primary text-primary-foreground rounded-card-lg p-6 shadow-float hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="size-6" />
              <h2 className="text-lg font-bold">발산 세션 시작</h2>
            </div>
            <p className="text-sm text-primary-foreground/80">
              키워드를 조합하여 새로운 아이디어를 생성하세요
            </p>
          </div>
        </Link>
        <Link href="/ideas">
          <div className="bg-surface rounded-card-lg p-6 shadow-marshmallow hover:shadow-marshmallow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-white/80">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="size-6 text-primary" />
              <h2 className="text-lg font-bold text-text-main">아이디어 보기</h2>
            </div>
            <p className="text-sm text-text-muted">
              칸반 보드에서 아이디어를 관리하세요
            </p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Lightbulb className="size-5 text-primary" />}
          label="전체 아이디어"
          value={loading ? "—" : String(totalCount)}
        />
        <StatCard
          icon={<BookmarkCheck className="size-5 text-amber-500" />}
          label="북마크"
          value={loading ? "—" : String(bookmarkedCount)}
        />
        <StatCard
          icon={<Eye className="size-5 text-teal-500" />}
          label="검토 중"
          value={loading ? "—" : String(reviewingCount)}
        />
      </div>

      {/* Recent Bookmarks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">최근 북마크</h2>
          {bookmarked.length > 0 && (
            <Button variant="ghost" size="sm" render={<Link href="/ideas" />}>
              전체 보기
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        ) : bookmarked.length === 0 ? (
          <div className="bg-surface rounded-card-lg shadow-marshmallow-inset p-12 text-center">
            <BookmarkCheck className="size-12 text-text-muted/30 mx-auto mb-4" />
            <p className="text-text-muted">아직 북마크한 아이디어가 없습니다</p>
            <p className="text-xs text-text-muted/60 mt-1">
              발산 세션에서 마음에 드는 아이디어를 북마크해보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarked.slice(0, 6).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-card-lg shadow-marshmallow p-5 border border-white/80">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-text-muted">{label}</span>
      </div>
      <span className="text-2xl font-black text-text-main">{value}</span>
    </div>
  );
}
