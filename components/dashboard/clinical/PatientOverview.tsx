"use client";

import { ClinicalDashboard } from "@/types/dashboard";
import { User, AlertTriangle, Pill } from "lucide-react";
import { formatText } from "@/lib/utils";

interface PatientOverviewProps {
  dashboard: ClinicalDashboard;
}

export function PatientOverview({ dashboard }: PatientOverviewProps) {
  const { demographics, chief_complaint, allergies, current_medications } = dashboard;

  const complaintText = formatText(chief_complaint);

  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-careflow-teal" />
        <h3 className="font-semibold text-foreground">Patient Overview</h3>
      </div>

      <div className="space-y-4">
        {demographics && (
          <div className="grid grid-cols-3 gap-3">
            {demographics.name && (
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-semibold text-foreground">{formatText(demographics.name)}</p>
              </div>
            )}
            {demographics.age && (
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-sm font-medium text-foreground">{formatText(demographics.age)} yrs</p>
              </div>
            )}
            {demographics.gender && (
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium text-foreground">{formatText(demographics.gender)}</p>
              </div>
            )}
            {demographics.mrn && (
              <div>
                <p className="text-xs text-muted-foreground">MRN</p>
                <p className="text-sm font-mono font-medium text-foreground">{formatText(demographics.mrn)}</p>
              </div>
            )}
          </div>
        )}

        {complaintText && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Chief Complaint</p>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 px-3 py-2">
              <p className="text-sm text-amber-800 dark:text-amber-200 italic">&ldquo;{complaintText}&rdquo;</p>
            </div>
          </div>
        )}

        {allergies && allergies.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs font-medium text-red-500">Allergies</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a, i) => (
                <span key={i} className="text-xs bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full px-2.5 py-0.5">
                  {formatText(a)}
                </span>
              ))}
            </div>
          </div>
        )}

        {current_medications && current_medications.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Pill className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-xs font-medium text-muted-foreground">Current Medications</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {current_medications.map((m, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full px-2.5 py-0.5">
                  {formatText(m)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
