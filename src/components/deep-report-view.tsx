"use client";

import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Users,
  Swords,
  Coins,
  Rocket,
  AlertTriangle,
  Wrench,
  Check,
} from "lucide-react";
import type { DeepReportResponse } from "@/types";

interface DeepReportViewProps {
  report: DeepReportResponse;
  ideaTitle: string;
}

export function DeepReportView({ report, ideaTitle }: DeepReportViewProps) {
  return (
    <article className="paper-texture rounded-2xl shadow-marshmallow p-8 md:p-12 max-w-[800px] mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="mb-12 border-b border-border pb-6">
        <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">
          Generated Blueprint
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-text-main leading-tight">
          {ideaTitle}
        </h1>
      </div>

      {/* 1. Elevator Pitch */}
      <Section label="The Spark" color="bg-accent-peach" rotate="-rotate-2">
        <p className="text-lg text-text-main leading-relaxed">
          <span className="marker-highlight text-amber-900/90">
            {report.elevator_pitch}
          </span>
        </p>
      </Section>

      {/* 2. Problem */}
      <Section label="Problem" color="bg-accent-peach" rotate="rotate-1">
        <div className="bg-muted/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="size-5 text-primary" />
            <h4 className="font-bold text-text-main text-sm">문제 정의</h4>
          </div>
          <p className="text-sm text-text-muted">{report.problem}</p>
        </div>
      </Section>

      {/* 3. Solution */}
      <Section label="Solution" color="bg-accent-mint" rotate="-rotate-1">
        <ul className="space-y-3">
          {report.solution.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-mint/30 mt-0.5">
                <Check className="size-3 text-teal-700" />
              </div>
              <span className="text-sm text-text-main">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. Persona */}
      <Section label="Audience" color="bg-accent-mint" rotate="rotate-1">
        <div className="flex items-start gap-4">
          <Users className="size-8 text-primary shrink-0" />
          <div>
            <h4 className="font-bold text-text-main">{report.persona.name}</h4>
            <p className="text-sm text-text-muted mt-1">
              {report.persona.context}
            </p>
          </div>
        </div>
      </Section>

      {/* 5. Competition */}
      <Section label="Competition" color="bg-accent-lime" rotate="-rotate-1">
        <div className="space-y-3">
          {report.competition.map((comp, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"
            >
              <Swords className="size-4 text-lime-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text-main text-sm">
                  {comp.name}
                </span>
                <p className="text-xs text-text-muted mt-0.5">
                  {comp.difference}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Revenue Model */}
      <Section label="Revenue" color="bg-accent-lime" rotate="rotate-1">
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="size-5 text-primary" />
            <h4 className="font-bold text-text-main">수익 모델</h4>
          </div>
          <p className="text-sm text-text-muted">{report.revenue_model}</p>
        </div>
      </Section>

      {/* 7. MVP Scope */}
      <Section label="MVP" color="bg-accent-purple" rotate="-rotate-1">
        <ul className="space-y-2">
          {report.mvp_scope.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-text-main">
              <Rocket className="size-3.5 text-purple-600 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 8. Risks */}
      <Section label="Risks" color="bg-accent-purple" rotate="rotate-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">기술 리스크</span>
            </div>
            <p className="text-sm text-text-muted">{report.risks.technical}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-red-500" />
              <span className="text-xs font-bold text-red-700">시장 리스크</span>
            </div>
            <p className="text-sm text-text-muted">{report.risks.market}</p>
          </div>
        </div>
      </Section>

      {/* 9. Resources */}
      <Section label="Resources" color="bg-primary/30" rotate="-rotate-1">
        <div className="flex flex-wrap gap-3 items-center">
          <Wrench className="size-4 text-primary" />
          {report.resources.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-surface shadow-marshmallow px-3 py-1 text-xs font-semibold text-text-main border border-white/60"
            >
              {tech}
            </span>
          ))}
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {report.resources.timeline}
          </span>
        </div>
      </Section>

      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="inline-block w-24 h-1 bg-border rounded-full mb-4" />
        <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">
          End of Blueprint
        </p>
      </div>
    </article>
  );
}

function Section({
  label,
  color,
  rotate,
  children,
}: {
  label: string;
  color: string;
  rotate: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 relative">
      <div className={cn("absolute -left-3 -top-5 md:-left-8 transform", rotate)}>
        <div
          className={cn(
            "shadow-md px-3 py-1.5 rounded-sm text-xs font-bold",
            color,
            color.includes("peach") && "text-amber-900",
            color.includes("mint") && "text-teal-900",
            color.includes("lime") && "text-lime-900",
            color.includes("purple") && "text-purple-900",
            color.includes("primary") && "text-blue-900",
          )}
        >
          {label}
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}
