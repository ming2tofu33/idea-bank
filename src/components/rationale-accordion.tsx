"use client";

import { cn } from "@/lib/utils";
import { Info, AlertTriangle, HelpCircle, ChevronDown } from "lucide-react";
import type { EvaluationRationaleResponse } from "@/types";

interface RationaleAccordionProps {
  dimension: string;
  score: number;
  weight: number;
  rationale: EvaluationRationaleResponse;
}

const DIMENSION_LABELS: Record<string, string> = {
  market: "시장성",
  build: "실행 가능성",
  edge: "독창성",
  money: "수익성",
};

export function RationaleAccordion({
  dimension,
  score,
  weight,
  rationale,
}: RationaleAccordionProps) {
  return (
    <details className="bg-surface rounded-card shadow-marshmallow border border-white/80 overflow-hidden group">
      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <ChevronDown className="size-4 text-text-muted transition-transform duration-200 group-open:rotate-180" />
          <span className="text-sm font-bold text-text-main">
            {DIMENSION_LABELS[dimension] ?? dimension}
          </span>
          <span className="text-xs text-text-muted">
            가중치 {(weight * 100).toFixed(0)}%
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-sm font-bold",
            score >= 80
              ? "bg-score-high-bg text-score-high-text"
              : score >= 60
                ? "bg-score-mid-bg text-score-mid-text"
                : "bg-score-low-bg text-score-low-text",
          )}
        >
          {score}
        </span>
      </summary>

      <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
        {/* Reason */}
        <div className="flex items-start gap-2">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-primary block mb-0.5">
              근거
            </span>
            <p className="text-sm text-text-main">{rationale.reason}</p>
          </div>
        </div>

        {/* Counterargument */}
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-600 block mb-0.5">
              반론
            </span>
            <p className="text-sm text-text-main">
              {rationale.counterargument}
            </p>
          </div>
        </div>

        {/* Verification needed */}
        <div className="flex items-start gap-2">
          <HelpCircle className="size-4 text-text-muted shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-text-muted block mb-0.5">
              확인 필요
            </span>
            <p className="text-sm text-text-main">
              {rationale.verification_needed}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
