"use client";

import { cn } from "@/lib/utils";
import { MODE_OPTIONS } from "@/lib/constants";
import { Target, Shuffle, Sparkles } from "lucide-react";
import type { GenerationMode } from "@/types";

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const MODE_ICONS: Record<GenerationMode, React.ElementType> = {
  full_match: Target,
  forced_pairing: Shuffle,
  serendipity: Sparkles,
};

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="생성 모드 선택">
      {MODE_OPTIONS.map((option) => {
        const Icon = MODE_ICONS[option.value];
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 min-h-10 text-xs font-semibold transition-all cursor-pointer",
              isSelected
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-surface text-text-muted border border-transparent hover:bg-muted hover:shadow-sm",
            )}
            title={option.description}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
