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
    <div className="-mx-4 sm:-mx-6 md:-mx-10">
      <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 md:px-10 pb-4">
        {STATUS_COLUMNS.map((status) => {
          const columnIdeas = ideas.filter((i) => i.status === status);
          return (
            <div
              key={status}
              className="min-w-[220px] w-[220px] shrink-0 bg-muted/30 rounded-card-lg p-3 border border-border/50"
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
                  <div className="text-center py-8 text-muted-foreground">
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
        {/* End spacer for scroll padding */}
        <div className="shrink-0 w-px" aria-hidden />
      </div>
    </div>
  );
}
