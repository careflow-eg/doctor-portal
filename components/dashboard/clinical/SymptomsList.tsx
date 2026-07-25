"use client";

import { Symptom } from "@/types/dashboard";
import { Activity } from "lucide-react";
import { cn, formatText } from "@/lib/utils";

interface SymptomsListProps {
  symptoms: Symptom[];
}

const severityConfig = {
  mild: { label: "Mild", bar: "w-1/4 bg-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  moderate: { label: "Moderate", bar: "w-2/4 bg-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  severe: { label: "Severe", bar: "w-3/4 bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

export function SymptomsList({ symptoms }: SymptomsListProps) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">Symptoms</h3>
        <span className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
          {symptoms.length}
        </span>
      </div>

      {symptoms.length === 0 ? (
        <p className="text-sm text-muted-foreground">No symptoms recorded</p>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom, i) => {
            const severityKey = (typeof symptom.severity === "string" ? symptom.severity.toLowerCase() : "mild") as keyof typeof severityConfig;
            const config = severityConfig[severityKey] ?? severityConfig.mild;
            const nameText = formatText(symptom.name);
            const durationText = formatText(symptom.duration);
            const onsetText = formatText(symptom.onset);

            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{nameText}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", config.badge)}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {durationText && <span>Duration: {durationText}</span>}
                    {onsetText && <span>· Onset: {onsetText}</span>}
                  </div>
                  {symptom.confidence !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>AI Confidence</span>
                        <span>{Math.round(symptom.confidence * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-careflow-teal rounded-full transition-all"
                          style={{ width: `${symptom.confidence * 100}%` }}
                        />
                      </div>
                    </div>
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
