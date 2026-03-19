"use client";

import { useState } from "react";
import { KeywordGrid } from "@/components/keyword-grid";
import { useFetch } from "@/hooks/use-fetch";
import { fetchKeywords, createKeyword, deleteKeyword } from "@/lib/api";
import { CATEGORY_ORDER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Plus, AlertCircle } from "lucide-react";
import type { KeywordCategory } from "@/types";

export default function KeywordsPage() {
  const { data, loading, error, refetch } = useFetch(() => fetchKeywords());
  const [newKeyword, setNewKeyword] = useState("");
  const [newCategory, setNewCategory] = useState<KeywordCategory>("domain");
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    setAddLoading(true);
    setActionError(null);
    try {
      await createKeyword({ keyword: newKeyword.trim(), category: newCategory });
      setNewKeyword("");
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "추가 중 오류 발생",
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    setActionError(null);
    try {
      await deleteKeyword(id);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "삭제 중 오류 발생",
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">키워드 관리</h1>
        <p className="text-text-muted mt-1">
          아이디어 생성에 사용할 키워드 풀을 관리하세요
        </p>
      </div>

      {/* Error */}
      {(error || actionError) && (
        <div className="mb-6 bg-destructive/10 text-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error || actionError}</span>
        </div>
      )}

      {/* Add keyword form */}
      <div className="bg-surface rounded-card-lg shadow-marshmallow p-6 mb-8">
        <h2 className="text-sm font-bold text-text-main mb-4">
          커스텀 키워드 추가
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1">
            <label htmlFor="new-keyword" className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              키워드
            </label>
            <Input
              id="new-keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="새 키워드 입력"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="new-category" className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              카테고리
            </label>
            <Select
              value={newCategory}
              onValueChange={(v) => setNewCategory(v as KeywordCategory)}
            >
              <SelectTrigger id="new-category" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={addLoading || !newKeyword.trim()}>
            <Plus className="size-4" />
            <span>{addLoading ? "추가 중..." : "추가"}</span>
          </Button>
        </div>
      </div>

      {/* Keyword grid */}
      {loading ? (
        <div className="space-y-8">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat} className="space-y-4">
              <LoadingSkeleton variant="line" className="w-24" />
              <div className="flex flex-wrap gap-3">
                <LoadingSkeleton variant="pill" count={8} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KeywordGrid
          keywords={data?.keywords ?? []}
          onDelete={handleDelete}
          deleteLoading={deleteLoading}
        />
      )}
    </div>
  );
}
