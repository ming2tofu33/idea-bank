"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { KeywordCategory } from "@/types";

interface CategoryBadgeProps {
  category: KeywordCategory;
  label?: string;
  className?: string;
}

export function CategoryBadge({
  category,
  label,
  className,
}: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        colors.bg,
        colors.text,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", colors.dot)} />
      {label ?? CATEGORY_LABELS[category]}
    </span>
  );
}
