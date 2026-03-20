"use client";

import { useState, useMemo } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { fetchBlueprints } from "@/lib/api";
import { BlueprintCard } from "@/components/blueprint-card";
import { BlueprintModal } from "@/components/blueprint-modal";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search } from "lucide-react";
import type { BlueprintListItem } from "@/types";

type SortKey = "newest" | "score";
type ScoreFilter = "all" | "high" | "mid" | "low";

function getDateGroup(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const daysDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysDiff < 7) return "이번 주";
  if (daysDiff < 14) return "지난 주";
  return `${date.getMonth() + 1}월`;
}

// 날짜 그룹 키 정렬: 이번 주 → 지난 주 → N월 내림차순
function sortGroupKeys(keys: string[]): string[] {
  const fixed = ["이번 주", "지난 주"];
  const monthKeys = keys
    .filter((k) => !fixed.includes(k))
    .sort((a, b) => parseInt(b) - parseInt(a));
  return [...fixed.filter((k) => keys.includes(k)), ...monthKeys];
}

export default function BlueprintsPage() {
  const { data, loading, error } = useFetch(() => fetchBlueprints());

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [selected, setSelected] = useState<BlueprintListItem | null>(null);

  const filtered = useMemo(() => {
    if (!data?.blueprints) return [];
    let items = [...data.blueprints];

    // 텍스트 검색 (아이디어 제목)
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((b) => b.idea_title.toLowerCase().includes(q));
    }

    // 점수 필터
    if (scoreFilter === "high")
      items = items.filter((b) => (b.total_score ?? -1) >= 80);
    else if (scoreFilter === "mid")
      items = items.filter(
        (b) => (b.total_score ?? -1) >= 60 && (b.total_score ?? -1) < 80,
      );
    else if (scoreFilter === "low")
      items = items.filter(
        (b) => b.total_score != null && b.total_score < 60,
      );

    // 정렬
    if (sort === "score") {
      items.sort((a, b) => {
        if (a.total_score == null && b.total_score == null) return 0;
        if (a.total_score == null) return 1;  // null → 맨 뒤
        if (b.total_score == null) return -1;
        return b.total_score - a.total_score;
      });
    } else {
      // newest: API가 이미 최신순으로 반환하지만 명시적으로 정렬
      items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return items;
  }, [data, search, sort, scoreFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, BlueprintListItem[]> = {};
    for (const bp of filtered) {
      const key = getDateGroup(bp.created_at);
      if (!map[key]) map[key] = [];
      map[key].push(bp);
    }
    return map;
  }, [filtered]);

  const groupKeys = sortGroupKeys(Object.keys(grouped));
  const hasData = (data?.blueprints.length ?? 0) > 0;

  return (
    <div className="pb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-main">Blueprints</h1>
          <p className="text-sm text-text-muted">생성된 모든 Blueprint 리포트</p>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-surface rounded-card-lg border border-border shadow-marshmallow">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-muted" />
          <Input
            placeholder="아이디어 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          value={scoreFilter}
          onValueChange={(v) => setScoreFilter(v as ScoreFilter)}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">전체 점수</SelectItem>
            <SelectItem value="high" className="text-xs">80점 이상</SelectItem>
            <SelectItem value="mid" className="text-xs">60–79점</SelectItem>
            <SelectItem value="low" className="text-xs">60점 미만</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-xs">최신순</SelectItem>
            <SelectItem value="score" className="text-xs">점수 높은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="space-y-8">
          {[0, 1].map((i) => (
            <div key={i}>
              <LoadingSkeleton variant="line" className="w-20 h-4 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <LoadingSkeleton variant="card" className="h-36" />
                <LoadingSkeleton variant="card" className="h-36" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && !loading && (
        <div className="text-center py-20 text-destructive">{error}</div>
      )}

      {/* Blueprint 없음 (아직 생성 안 함) */}
      {!loading && !error && !hasData && (
        <div className="text-center py-20">
          <FileText className="size-10 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">아직 생성된 Blueprint가 없어요.</p>
          <p className="text-sm text-text-muted mt-1">
            아이디어 상세 페이지에서 Blueprint를 생성해보세요.
          </p>
        </div>
      )}

      {/* 필터 결과 없음 */}
      {!loading && !error && hasData && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted">조건에 맞는 Blueprint가 없어요.</p>
        </div>
      )}

      {/* 날짜 그룹 카드 그리드 */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-10">
          {groupKeys.map((groupKey) => (
            <section key={groupKey}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  {groupKey}
                </h2>
                <span className="text-xs text-text-muted">
                  · {grouped[groupKey].length}개
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {grouped[groupKey].map((bp) => (
                  <BlueprintCard
                    key={bp.report_id}
                    blueprint={bp}
                    onClick={() => setSelected(bp)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* 모달 */}
      <BlueprintModal
        reportId={selected?.report_id ?? null}
        ideaId={selected?.idea_id ?? null}
        ideaTitle={selected?.idea_title ?? ""}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
