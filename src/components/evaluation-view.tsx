"use client";

import { ScoreRing } from "@/components/score-ring";
import { RationaleAccordion } from "@/components/rationale-accordion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ListChecks } from "lucide-react";
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

export function EvaluationView({ evaluation }: EvaluationViewProps) {
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
        <div className="flex justify-center relative">
          <ScoreRing score={evaluation.total_score} size={160} />
        </div>

        {/* Score Bars */}
        <div className="space-y-4">
          {(["market", "build", "edge", "money"] as const).map((dim) => {
            const score = evaluation.scores[dim];
            return (
              <div key={dim} className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-muted w-16 text-right">
                  {dim === "market"
                    ? "시장성"
                    : dim === "build"
                      ? "실행"
                      : dim === "edge"
                        ? "독창성"
                        : "수익성"}
                </span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-text-main w-8">
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

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
