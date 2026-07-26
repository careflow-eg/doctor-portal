"use client";

import { DifferentialDiagnosis as DiffDxType } from "@/types/dashboard";
import { Stethoscope, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatText } from "@/lib/utils";
import { useState } from "react";

interface DifferentialDiagnosisProps {
  diagnoses: DiffDxType[];
}

export function DifferentialDiagnosis({ diagnoses }: DifferentialDiagnosisProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const list = Array.isArray(diagnoses) ? diagnoses : [];
  const sorted = [...list].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-5 w-5 text-careflow-teal" />
        <h3 className="font-semibold text-foreground">Differential Diagnosis</h3>
        <span className="ml-auto text-xs text-muted-foreground">{list.length} conditions considered</span>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No differential diagnoses generated</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((dx, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                i === 0 ? "border-careflow-teal/40" : "border-border"
              )}
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                {/* Rank */}
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 ? "bg-careflow-teal text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>

                {/* Name + ICD */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{formatText(dx.diagnosis)}</p>
                    {dx.icd_code && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {formatText(dx.icd_code)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="w-20 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", i === 0 ? "bg-careflow-teal" : "bg-muted-foreground/50")}
                      style={{ width: `${Math.round((dx.confidence ?? 0.5) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-10 text-right">
                    {Math.round((dx.confidence ?? 0.5) * 100)}%
                  </span>
                </div>

                {expanded === i ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {expanded === i && (
                <div className="px-4 pb-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dx.supporting_evidence && dx.supporting_evidence.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Supporting Evidence</p>
                      </div>
                      <ul className="space-y-1">
                        {dx.supporting_evidence.map((ev, j) => (
                          <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span> {formatText(ev)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dx.against_evidence && dx.against_evidence.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">Against Evidence</p>
                      </div>
                      <ul className="space-y-1">
                        {dx.against_evidence.map((ev, j) => (
                          <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">•</span> {formatText(ev)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
