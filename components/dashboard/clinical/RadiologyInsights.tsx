"use client";

import { RadiologyInsight } from "@/types/dashboard";
import { ImageIcon } from "lucide-react";
import { formatText } from "@/lib/utils";

interface RadiologyInsightsProps {
  insights: RadiologyInsight[];
}

export function RadiologyInsights({ insights }: RadiologyInsightsProps) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5 text-purple-500" />
        <h3 className="font-semibold text-foreground">Radiology Insights</h3>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">No radiology data available</p>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              {(insight.modality || insight.body_part) && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-950/20 border-b border-border">
                  {insight.modality && (
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                      {formatText(insight.modality)}
                    </span>
                  )}
                  {insight.body_part && (
                    <span className="text-xs text-muted-foreground">· {formatText(insight.body_part)}</span>
                  )}
                  {insight.confidence !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              )}
              <div className="px-4 py-3 space-y-3">
                {insight.findings && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Findings</p>
                    <p className="text-sm text-foreground">{formatText(insight.findings)}</p>
                  </div>
                )}
                {insight.impression && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Impression</p>
                    <p className="text-sm text-foreground font-medium">{formatText(insight.impression)}</p>
                  </div>
                )}
                {insight.clinical_significance && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2.5">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">Clinical Significance</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">{formatText(insight.clinical_significance)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
