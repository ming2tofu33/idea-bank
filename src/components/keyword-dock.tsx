"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { ModeSelector } from "@/components/mode-selector";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Keyword, GenerationMode } from "@/types";

interface KeywordDockProps {
  selectedKeywords: Keyword[];
  onRemove: (keyword: Keyword) => void;
  onGenerate: () => void;
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  generating: boolean;
}

export function KeywordDock({
  selectedKeywords,
  onRemove,
  onGenerate,
  mode,
  onModeChange,
  generating,
}: KeywordDockProps) {
  const canGenerate = selectedKeywords.length > 0 && !generating;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="glass-panel w-full max-w-4xl rounded-3xl p-4 shadow-float pointer-events-auto flex items-center justify-between gap-4">
        {/* Selected keywords */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-1">
          {selectedKeywords.length === 0 ? (
            <div className="h-9 border-2 border-dashed border-text-muted/20 rounded-full flex items-center px-4">
              <span className="text-xs font-bold text-text-muted/60 uppercase tracking-wider">
                키워드를 선택하세요
              </span>
            </div>
          ) : (
            selectedKeywords.map((kw) => {
              const colors = CATEGORY_COLORS[kw.category];
              return (
                <div
                  key={kw.id}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 border",
                    colors.bg,
                    `border-${colors.dot.replace("bg-", "")}/50`,
                  )}
                >
                  <span className="text-sm font-semibold text-text-main">
                    {kw.keyword}
                  </span>
                  <button
                    onClick={() => onRemove(kw)}
                    className="flex size-4 items-center justify-center rounded-full hover:bg-black/5 text-text-main/50 hover:text-text-main transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Mode + Generate */}
        <div className="shrink-0 flex items-center gap-3 pl-3 border-l border-black/5">
          <ModeSelector value={mode} onChange={onModeChange} />
          <Button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="rounded-full px-5 py-2.5 font-bold shadow-float"
            size="lg"
          >
            <Sparkles className="size-4" />
            <span>{generating ? "생성 중..." : "Mix Ideas"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
