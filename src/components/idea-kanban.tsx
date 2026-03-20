"use client";

import { STATUS_COLUMNS, STATUS_LABELS } from "@/lib/constants";
import { IdeaCard } from "@/components/idea-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Idea, IdeaStatus } from "@/types";

interface IdeaKanbanProps {
  ideas: Idea[];
  onStatusChange: (id: string, newStatus: IdeaStatus) => void;
  onBookmarkToggle: (id: string, bookmarked: boolean) => void;
}

const COLUMN_EMPTY_HINTS: Record<IdeaStatus, { icon: string; text: string }> = {
  new: { icon: "✦", text: "아이디어 생성 후 자동으로 추가됩니다" },
  interested: { icon: "★", text: "관심 있는 아이디어를 여기로 옮기세요" },
  reviewing: { icon: "🔍", text: "깊게 탐구할 아이디어를 옮기세요" },
  executing: { icon: "⚡", text: "실행 중인 아이디어가 여기 표시됩니다" },
  on_hold: { icon: "⏸", text: "잠시 보류 중인 아이디어" },
  archived: { icon: "📦", text: "보관된 아이디어가 여기 있습니다" },
};

export function IdeaKanban({
  ideas,
  onStatusChange,
  onBookmarkToggle,
}: IdeaKanbanProps) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        {STATUS_COLUMNS.map((status) => {
          const columnIdeas = ideas.filter((i) => i.status === status);
          return (
            <div
              key={status}
              className="bg-muted/30 rounded-card-lg p-3 border border-border/50"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {columnIdeas.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnIdeas.map((idea) => (
                  <div key={idea.id}>
                    <IdeaCard
                      idea={idea}
                      onBookmarkToggle={onBookmarkToggle}
                      compact
                    />
                    {/* Status change dropdown */}
                    <Select
                      value={idea.status}
                      onValueChange={(v) =>
                        onStatusChange(idea.id, v as IdeaStatus)
                      }
                    >
                      <SelectTrigger className="h-7 mt-1 text-xs bg-transparent border-none shadow-none px-2 text-muted-foreground hover:text-foreground">
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
                  </div>
                ))}
                {columnIdeas.length === 0 && (
                  <div className="text-center py-8 px-2">
                    <div className="text-2xl mb-2">{COLUMN_EMPTY_HINTS[status].icon}</div>
                    <p className="text-xs text-text-muted leading-snug">
                      {COLUMN_EMPTY_HINTS[status].text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
