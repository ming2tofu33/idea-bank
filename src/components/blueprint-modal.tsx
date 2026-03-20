"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchBlueprintDetail } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import type { DeepReportResponse } from "@/types";

const DeepReportView = dynamic(
  () => import("@/components/deep-report-view").then((m) => m.DeepReportView),
  { ssr: false },
);

interface BlueprintModalProps {
  reportId: string | null;  // null이면 모달 닫힘
  ideaId: string | null;
  ideaTitle: string;
  onClose: () => void;
}

export function BlueprintModal({
  reportId,
  ideaId,
  ideaTitle,
  onClose,
}: BlueprintModalProps) {
  const router = useRouter();
  const [report, setReport] = useState<DeepReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchBlueprintDetail(reportId)
      .then((data) => setReport(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "불러오기 실패"),
      )
      .finally(() => setLoading(false));
  }, [reportId]);

  return (
    <Dialog open={reportId != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pr-8">
          <DialogTitle className="text-lg font-bold leading-snug flex-1 line-clamp-2">
            {ideaTitle}
          </DialogTitle>
          {ideaId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push(`/ideas/${ideaId}`);
                onClose();
              }}
              className="shrink-0 text-xs gap-1"
            >
              아이디어 보기
              <ArrowUpRight className="size-3.5" />
            </Button>
          )}
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="space-y-4">
              <LoadingSkeleton variant="line" className="h-6 w-48" />
              <LoadingSkeleton variant="card" className="h-40" />
              <LoadingSkeleton variant="card" className="h-40" />
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-3 text-destructive bg-destructive/10 rounded-card p-4">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {report && !loading && (
            <DeepReportView report={report} ideaTitle={ideaTitle} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
