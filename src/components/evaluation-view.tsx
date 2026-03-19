"use client";

import { ScoreRing } from "@/components/score-ring";
import { RationaleAccordion } from "@/components/rationale-accordion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ListChecks, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvaluateResponse } from "@/types";

interface EvaluationViewProps {
  evaluation: EvaluateResponse;
}

const DIMENSION_WEIGHTS: Record<string, number> = {
  market: 0.3,
  build: 0.25,
  edge: 0.25,
  money: 0.2,
};

const DIMENSION_KO: Record<string, string> = {
  market: "시장성",
  build: "실행 가능성",
  edge: "독창성",
  money: "수익성",
};

export function EvaluationView({ evaluation }: EvaluationViewProps) {
  const dims = ["market", "build", "edge", "money"] as const;
  const weakestDim = dims.reduce(
    (min, dim) => evaluation.scores[dim] < evaluation.scores[min] ? dim : min,
    dims[0],
  );

  return (
    <div className="max-w-[800px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main">Feasibility Pulse</h2>
        <Badge variant="secondary" className="text-xs">
          Analysis Complete
        </Badge>
      </div>

      {/* Score Ring + Bar Chart row */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
        {/* Total Score Ring */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <ScoreRing score={evaluation.total_score} size={160} />
          </div>
          <div className="flex gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-score-high-stroke" />
              80+ 우수
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-score-mid-stroke" />
              60+ 양호
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-score-low-stroke" />
              미만 보완
            </span>
          </div>
        </div>

        {/* Score Bars */}
        <div className="space-y-4">
          {dims.map((dim) => {
            const score = evaluation.scores[dim];
            const isWeakest = dim === weakestDim;
            return (
              <div key={dim} className="flex items-center gap-3">
                <span className={cn(
                  "text-xs font-bold w-16 text-right",
                  isWeakest ? "text-score-low-text" : "text-text-muted",
                )}>
                  {DIMENSION_KO[dim]}
                </span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      isWeakest ? "bg-score-low-stroke" : "bg-primary",
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-bold w-8",
                  isWeakest ? "text-score-low-text" : "text-text-main",
                )}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weakest dimension warning */}
      {evaluation.scores[weakestDim] < 60 && (
        <div className="flex items-start gap-2 bg-score-low-bg rounded-xl px-4 py-3 border border-score-low-stroke/30">
          <AlertTriangle className="size-4 text-score-low-text shrink-0 mt-0.5" />
          <p className="text-sm text-score-low-text">
            <span className="font-bold">{DIMENSION_KO[weakestDim]}</span>이 가장 취약합니다 ({evaluation.scores[weakestDim]}점). 아코디언을 펼쳐 근거와 반론을 확인하세요.
          </p>
        </div>
      )}

      {/* Rationale Accordions */}
      <div className="space-y-3">
        {(["market", "build", "edge", "money"] as const).map((dim) => (
          <RationaleAccordion
            key={dim}
            dimension={dim}
            score={evaluation.scores[dim]}
            weight={DIMENSION_WEIGHTS[dim]}
            rationale={evaluation.rationales[dim]}
          />
        ))}
      </div>

      {/* Ethics */}
      <div className="bg-surface rounded-card shadow-marshmallow p-4 flex items-center gap-3">
        {evaluation.ethics.flag ? (
          <>
            <ShieldAlert className="size-5 text-amber-500" />
            <div>
              <span className="text-sm font-bold text-amber-700">
                윤리적 리스크 감지
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                {evaluation.ethics.note}
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="size-5 text-green-500" />
            <span className="text-sm font-semibold text-green-700">
              윤리적 리스크 없음
            </span>
          </>
        )}
      </div>

      {/* Next Steps */}
      {evaluation.next_steps.length > 0 && (
        <div className="bg-surface rounded-card-lg shadow-marshmallow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-text-main">Next Steps</h3>
          </div>
          <ol className="space-y-2">
            {evaluation.next_steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-text-main"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
