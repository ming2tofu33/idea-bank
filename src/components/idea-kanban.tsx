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

export function IdeaKanban({
  ideas,
  onStatusChange,
  onBookmarkToggle,
}: IdeaKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-6">
      {STATUS_COLUMNS.map((status) => {
        const columnIdeas = ideas.filter((i) => i.status === status);
        return (
          <div
            key={status}
            className="min-w-[180px] bg-muted/30 rounded-card p-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wide">
                {STATUS_LABELS[status]}
              </h3>
              <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-text-muted">
                {columnIdeas.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnIdeas.map((idea) => (
                <div key={idea.id} className="space-y-1">
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
                    <SelectTrigger className="h-6 text-[10px] bg-transparent border-none shadow-none px-1">
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
                <div className="text-center py-8 text-text-muted">
                  <div className="size-8 rounded-full bg-muted/50 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs">—</span>
                  </div>
                  <span className="text-xs">비어 있음</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
