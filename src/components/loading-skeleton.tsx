"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "pill" | "line";
  className?: string;
  count?: number;
}

export function LoadingSkeleton({
  variant = "card",
  className,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClass = "animate-pulse bg-surface shadow-marshmallow";

  const variantClass = {
    card: "rounded-card-lg h-40",
    pill: "rounded-full h-10 w-24",
    line: "rounded-md h-4 w-full",
  }[variant];

  return (
    <div role="status" aria-label="로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(baseClass, variantClass, className)} />
      ))}
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
