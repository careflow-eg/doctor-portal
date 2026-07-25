"use client";

import { LabInsight as LabInsightType } from "@/types/dashboard";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabInsightsProps {
  insight?: LabInsightType;
}

const statusColors = {
  normal: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
  high: "text-red-600 bg-red-50 dark:bg-red-950/20",
  low: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
  critical: "text-red-700 bg-red-100 dark:bg-red-950/30 font-bold",
};

export function LabInsights({ insight }: LabInsightsProps) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-foreground">Lab Insights</h3>
        {insight?.abnormal_count !== undefined && insight.abnormal_count > 0 && (
          <span className="ml-auto text-xs bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full">
            {insight.abnormal_count} abnormal
          </span>
        )}
      </div>

      {!insight ? (
        <p className="text-sm text-muted-foreground">No lab data available</p>
      ) : (
        <div className="space-y-4">
          {insight.summary && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">{insight.summary}</p>
            </div>
          )}

          {insight.findings && insight.findings.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Test</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Value</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 hidden sm:table-cell">Reference</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {insight.findings.map((f, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-medium text-foreground">{f.test_name}</td>
                      <td className="px-3 py-2 font-mono text-foreground">{f.value} {f.unit}</td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{f.reference_range}</td>
                      <td className="px-3 py-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[f.status ?? "normal"])}>
                          {f.status ?? "Normal"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {insight.interpretation && (
            <p className="text-sm text-muted-foreground">{insight.interpretation}</p>
          )}
        </div>
      )}
    </div>
  );
}
