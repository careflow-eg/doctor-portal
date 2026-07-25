"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { encounterService } from "@/services/encounterService";
import { useNotificationStore } from "@/stores/notificationStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClinicalDashboard } from "@/types/dashboard";
import { PatientOverview } from "@/components/dashboard/clinical/PatientOverview";
import { SymptomsList } from "@/components/dashboard/clinical/SymptomsList";
import { LabInsights } from "@/components/dashboard/clinical/LabInsights";
import { RadiologyInsights } from "@/components/dashboard/clinical/RadiologyInsights";
import { DifferentialDiagnosis } from "@/components/dashboard/clinical/DifferentialDiagnosis";
import { SuggestedInvestigations } from "@/components/dashboard/clinical/SuggestedInvestigations";
import { SuggestedActions } from "@/components/dashboard/clinical/SuggestedActions";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Loader2,
  ArrowLeft,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ClinicalDashboardClient({ id }: { id: string }) {
  const { addNotification } = useNotificationStore();
  const [dashboard, setDashboard] = useState<ClinicalDashboard | null>(null);

  const { data: encounter } = useQuery({
    queryKey: ["encounter", id],
    queryFn: () => encounterService.getEncounter(id),
  });

  const generateMutation = useMutation({
    mutationFn: () => dashboardService.generateDashboard(id),
    onSuccess: (data) => {
      setDashboard(data);
      addNotification({ type: "success", title: "Clinical dashboard generated!" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Dashboard generation failed", message: "Ensure history collection is complete." });
    },
  });

  const existingDashboard = encounter?.step_results.find(
    (s) => s.service_name === "DECISION_SUPPORT" && s.status === "SUCCESS"
  );

  const dashboardData: ClinicalDashboard | null =
    dashboard ?? (existingDashboard?.structured_data as ClinicalDashboard | null);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/encounters/${id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to encounter
        </Link>
      </div>

      <PageHeader
        title="Clinical Dashboard"
        subtitle="AI-generated clinical intelligence summary"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60 shadow-md"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Brain className="h-4 w-4" /> {dashboardData ? "Regenerate" : "Generate Dashboard"}</>
              )}
            </button>
            {dashboardData && (
              <Link
                href={`/encounters/${id}/assistant`}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 hover:bg-muted px-4 py-2.5 text-sm font-medium text-foreground transition-all"
              >
                <Bot className="h-4 w-4" />
                Ask AI Assistant
              </Link>
            )}
          </div>
        }
      />

      {generateMutation.isPending && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-careflow-teal/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-careflow-teal animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-foreground">Generating Clinical Dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">
              AI is analyzing history, labs, and radiology data...
            </p>
          </div>
        </div>
      )}

      {!dashboardData && !generateMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">No Dashboard Yet</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Complete history collection first, then generate the AI clinical dashboard.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            className="flex items-center gap-2 rounded-xl bg-careflow-teal text-white px-5 py-2.5 text-sm font-medium hover:bg-careflow-teal-hover transition-all"
          >
            <Brain className="h-4 w-4" />
            Generate Dashboard
          </button>
        </div>
      )}

      {dashboardData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Patient Overview + Symptoms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientOverview dashboard={dashboardData} />
            <SymptomsList symptoms={dashboardData.symptoms ?? []} />
          </div>

          {/* Lab + Radiology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LabInsights insight={dashboardData.lab_insights} />
            <RadiologyInsights insights={dashboardData.radiology_insights ?? []} />
          </div>

          {/* Differential Diagnosis */}
          <DifferentialDiagnosis diagnoses={dashboardData.differential_diagnosis ?? []} />

          {/* Investigations + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SuggestedInvestigations investigations={dashboardData.suggested_investigations ?? []} />
            <SuggestedActions actions={dashboardData.suggested_actions ?? []} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
