"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import { fetchIdeas, fetchStats } from "@/lib/api";
import { IdeaCard } from "@/components/idea-card";
import { SerendipityCard } from "@/components/serendipity-card";
import { patchIdea } from "@/lib/api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  Sparkles,
  Layers,
  Lightbulb,
  BookmarkCheck,
  Eye,
  ArrowRight,
  Archive,
  DollarSign,
} from "lucide-react";
import type { Keyword } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, refetch } = useFetch(() => fetchIdeas());
  const { data: stats } = useFetch(() => fetchStats());

  const handleSerendipitySelect = (keywords: Keyword[]) => {
    const ids = keywords.map((k) => k.id).join(",");
    router.push(`/generate?serendipity=${ids}`);
  };

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground mt-1">
          오늘도 5분, 아이디어를 발산해보세요
        </p>
      </div>

      {/* Stale Alert */}
      {stats && stats.stale_archived_count > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-card p-4 flex items-center gap-3">
          <Archive className="size-5 text-amber-500 shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            {stats.stale_archived_count}개 아이디어가 14일 이상 방치되어 자동
            아카이브되었습니다.
          </span>
          <Link
            href="/ideas"
            className="ml-auto text-xs font-semibold text-amber-600 hover:text-amber-700 shrink-0"
          >
            확인하기
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/generate" className="group">
          <div className="bg-primary text-primary-foreground rounded-card-lg p-6 shadow-float hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="size-5" />
                </div>
                <h2 className="text-lg font-bold">발산 세션 시작</h2>
              </div>
              <ArrowRight className="size-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm opacity-80">
              키워드를 조합하여 새로운 아이디어를 생성하세요
            </p>
          </div>
        </Link>
        <Link href="/ideas" className="group">
          <div className="bg-card text-card-foreground rounded-card-lg p-6 shadow-marshmallow hover:shadow-marshmallow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Layers className="size-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold">아이디어 보기</h2>
              </div>
              <ArrowRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-muted-foreground">
              칸반 보드에서 아이디어를 관리하세요
            </p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
        <StatCard
          icon={<Archive className="size-5 text-muted-foreground" />}
          label="방치 아카이브"
          value={stats ? String(stats.stale_archived_count) : "—"}
          warn={!!stats && stats.stale_archived_count > 0}
        />
        <StatCard
          icon={<DollarSign className="size-5 text-green-500" />}
          label="월간 비용"
          value={stats ? `$${stats.monthly_cost_usd.toFixed(2)}` : "—"}
          sub="/ $30"
        />
      </div>

      {/* Serendipity Recommendations */}
      <div className="mb-8">
        <SerendipityCard onSelect={handleSerendipitySelect} />
      </div>

      {/* Recent Bookmarks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">최근 북마크</h2>
          {bookmarked.length > 0 && (
            <Link
              href="/ideas"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              전체 보기
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        ) : bookmarked.length === 0 ? (
          <div className="bg-card rounded-card-lg shadow-marshmallow-inset p-12 text-center border border-border">
            <BookmarkCheck className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              아직 북마크한 아이디어가 없습니다
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              발산 세션에서 마음에 드는 아이디어를 북마크해보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  sub,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`bg-card rounded-card-lg shadow-marshmallow p-5 border ${
        warn ? "border-amber-300 dark:border-amber-700" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-foreground">{value}</span>
        {sub && (
          <span className="text-xs text-muted-foreground">{sub}</span>
        )}
      </div>
    </div>
  );
}
