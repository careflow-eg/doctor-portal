"use client";

import { SuggestedInvestigation } from "@/types/dashboard";
import { Search } from "lucide-react";
import { cn, formatText } from "@/lib/utils";

interface SuggestedInvestigationsProps {
  investigations: SuggestedInvestigation[];
}

const urgencyConfig = {
  routine: { label: "Routine", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  urgent: { label: "Urgent", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  stat: { label: "STAT", className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

export function SuggestedInvestigations({ investigations }: SuggestedInvestigationsProps) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-careflow-teal" />
        <h3 className="font-semibold text-foreground">Suggested Investigations</h3>
        <span className="ml-auto text-xs bg-careflow-teal/10 text-careflow-teal px-2 py-0.5 rounded-full">
          {investigations.length}
        </span>
      </div>

      {investigations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No investigations suggested</p>
      ) : (
        <div className="space-y-2.5">
          {investigations.map((inv, i) => {
            const urgencyKey = (typeof inv.urgency === "string" ? inv.urgency.toLowerCase() : "routine") as keyof typeof urgencyConfig;
            const urgency = urgencyConfig[urgencyKey] ?? urgencyConfig.routine;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/30 px-4 py-3">
                <div className="h-7 w-7 rounded-lg bg-careflow-teal/10 flex items-center justify-center shrink-0 text-xs font-bold text-careflow-teal">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{formatText(inv.investigation)}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", urgency.className)}>
                      {urgency.label}
                    </span>
                  </div>
                  {inv.rationale && (
                    <p className="text-xs text-muted-foreground">{formatText(inv.rationale)}</p>
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
