"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import { fetchIdea, patchIdea, generateReport, evaluateIdea } from "@/lib/api";
import { DeepReportView } from "@/components/deep-report-view";
import { EvaluationView } from "@/components/evaluation-view";
import { CategoryBadge } from "@/components/category-badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, STATUS_COLUMNS } from "@/lib/constants";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { IdeaStatus, DeepReportResponse, EvaluateResponse } from "@/types";

type Tab = "overview" | "blueprint" | "pulse";

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: idea, loading, error, refetch } = useFetch(
    () => fetchIdea(id),
    [id],
  );

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [report, setReport] = useState<DeepReportResponse | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluateResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setActionError(null);
    try {
      const result = await generateReport(id);
      setReport(result);
      setActiveTab("blueprint");
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "보고서 생성 실패",
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setEvalLoading(true);
    setActionError(null);
    try {
      const result = await evaluateIdea(id);
      setEvaluation(result);
      setActiveTab("pulse");
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "평가 실패",
      );
    } finally {
      setEvalLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    try {
      await patchIdea(id, { status: newStatus });
      refetch();
    } catch {
      toast.error("상태 변경에 실패했습니다");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!idea) return;
    try {
      await patchIdea(id, { bookmarked: !idea.bookmarked });
      refetch();
    } catch {
      toast.error("북마크 변경에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="line" className="w-64 h-8" />
        <LoadingSkeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error || "아이디어를 찾을 수 없습니다"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/ideas")}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Back + Status */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/ideas")}>
          <ArrowLeft className="size-4" />
          <span>목록</span>
        </Button>
        <div className="flex items-center gap-3">
          <Select
            value={idea.status}
            onValueChange={(v) => handleStatusChange(v as IdeaStatus)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_COLUMNS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={handleBookmarkToggle}
            aria-label={idea.bookmarked ? "북마크 해제" : "북마크"}
            aria-pressed={idea.bookmarked}
            className="min-w-10 min-h-10 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-muted/50 transition-colors"
          >
            {idea.bookmarked ? (
              <BookmarkCheck className="size-5 text-primary fill-primary/20" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {actionError && (
        <div className="mb-6 bg-destructive/10 text-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-3">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          개요
        </TabButton>
        <TabButton
          active={activeTab === "blueprint"}
          onClick={() => {
            if (report) setActiveTab("blueprint");
            else handleGenerateReport();
          }}
          disabled={reportLoading}
        >
          {reportLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileText className="size-3.5" />
          )}
          <span>{idea.deep_report_id || report ? "Blueprint" : "Report 생성"}</span>
        </TabButton>
        <TabButton
          active={activeTab === "pulse"}
          onClick={() => {
            if (evaluation) setActiveTab("pulse");
            else handleEvaluate();
          }}
          disabled={evalLoading || (!idea.deep_report_id && !report)}
        >
          {evalLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <BarChart3 className="size-3.5" />
          )}
          <span>{idea.evaluation_id || evaluation ? "Pulse" : "평가 실행"}</span>
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-surface rounded-card-xl shadow-marshmallow p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-main mb-2">
                  {idea.title}
                </h1>
                <p className="text-text-muted text-lg">{idea.summary}</p>
              </div>
              {idea.total_score != null && (
                <div className="shrink-0 flex flex-col items-center">
                  <span className="text-3xl font-black text-primary">
                    {idea.total_score}
                  </span>
                  <span className="text-xs text-text-muted">점</span>
                </div>
              )}
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mt-6">
              {idea.keywords_used.map((kw) => (
                <CategoryBadge key={kw} category="domain" label={kw} />
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              icon={<Sparkles className="size-5 text-primary" />}
              label="타겟 사용자"
              value={idea.target_user}
            />
            <InfoCard
              icon={<AlertCircle className="size-5 text-amber-500" />}
              label="핵심 문제"
              value={idea.problem}
            />
            <InfoCard
              icon={<FileText className="size-5 text-teal-500" />}
              label="솔루션 힌트"
              value={idea.solution_hint}
            />
          </div>

          {/* Status info */}
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Badge variant="secondary">{STATUS_LABELS[idea.status]}</Badge>
            <span>모드: {idea.generation_mode}</span>
          </div>
        </div>
      )}

      {activeTab === "blueprint" && report && (
        <DeepReportView report={report} ideaTitle={idea.title} />
      )}

      {activeTab === "pulse" && evaluation && (
        <EvaluationView evaluation={evaluation} />
      )}
    </div>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-text-muted hover:text-text-main hover:bg-muted"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface rounded-card shadow-marshmallow p-5 border border-white/80">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-text-muted">{label}</span>
      </div>
      <p className="text-sm text-text-main">{value}</p>
    </div>
  );
}
