"use client";

import { SuggestedAction } from "@/types/dashboard";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedActionsProps {
  actions: SuggestedAction[];
}

const priorityConfig = {
  low: { label: "Low", dot: "bg-emerald-400", border: "" },
  medium: { label: "Medium", dot: "bg-amber-400", border: "border-amber-200 dark:border-amber-800/30" },
  high: { label: "High", dot: "bg-red-500", border: "border-red-200 dark:border-red-800/30" },
};

export function SuggestedActions({ actions }: SuggestedActionsProps) {
  const sorted = [...actions].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority ?? "low"] ?? 2) - (order[b.priority ?? "low"] ?? 2);
  });

  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">Recommended Actions</h3>
        <span className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
          {actions.length}
        </span>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No actions recommended</p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((action, i) => {
            const priority = priorityConfig[action.priority ?? "low"] ?? priorityConfig.low;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-xl bg-muted/30 border px-4 py-3",
                  priority.border || "border-transparent"
                )}
              >
                <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", priority.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{action.action}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {priority.label} priority
                    </span>
                  </div>
                  {action.rationale && (
                    <p className="text-xs text-muted-foreground">{action.rationale}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
