"use client";

import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { useEncounterStore } from "@/stores/encounterStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { EncounterStatusBadge } from "@/components/encounters/EncounterStatusBadge";
import { WorkflowStepper } from "@/components/encounters/WorkflowStepper";
import { LabUpload } from "@/components/uploads/LabUpload";
import { RadiologyUpload } from "@/components/uploads/RadiologyUpload";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDateTime } from "@/lib/utils";
import {
  User,
  Phone,
  FileText,
  History,
  BarChart2,
  Bot,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";

export function EncounterDetailClient({ id }: { id: string }) {
  const { setActiveEncounter, workflowSteps } = useEncounterStore();

  const { data: encounter, isLoading, refetch } = useQuery({
    queryKey: ["encounter", id],
    queryFn: () => encounterService.getEncounter(id),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (encounter) setActiveEncounter(encounter);
  }, [encounter, setActiveEncounter]);

  if (isLoading || !encounter) return <PageLoader label="Loading encounter..." />;

  const patient = encounter.patient;

  const actions = [
    {
      href: `/encounters/${id}/history`,
      label: "History Collection",
      icon: History,
      available: true,
      color: "text-amber-500",
    },
    {
      href: `/encounters/${id}/dashboard`,
      label: "Clinical Dashboard",
      icon: BarChart2,
      available: encounter.status === "HISTORY_COMPLETED" || encounter.status === "DASHBOARD_GENERATED" || encounter.status === "COMPLETED",
      color: "text-purple-500",
    },
    {
      href: `/encounters/${id}/assistant`,
      label: "AI Assistant",
      icon: Bot,
      available: encounter.status === "DASHBOARD_GENERATED" || encounter.status === "COMPLETED",
      color: "text-blue-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <PageHeader
        title="Encounter Details"
        subtitle={`Created ${formatDateTime(encounter.created_at)}`}
        badge={<EncounterStatusBadge status={encounter.status} size="md" />}
        actions={
          <button
            onClick={() => refetch()}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Refresh
          </button>
        }
      />

      {/* Workflow Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-border p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Workflow Progress
        </h2>
        <WorkflowStepper steps={workflowSteps} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-careflow-teal" />
            Patient Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-semibold text-foreground">
                {patient?.full_name ?? "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-sm font-medium text-foreground">
                  {patient?.age ? `${patient.age} yrs` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium text-foreground">
                  {patient?.gender ?? "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MRN</p>
              <p className="text-sm font-medium font-mono text-foreground">
                {patient?.mrn ?? "—"}
              </p>
            </div>
            {patient?.contact_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm text-foreground">{patient.contact_number}</p>
              </div>
            )}
            {encounter.chief_complaint && (
              <div>
                <p className="text-xs text-muted-foreground">Chief Complaint</p>
                <p className="text-sm text-foreground italic">
                  &ldquo;{encounter.chief_complaint}&rdquo;
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-4"
        >
          <LabUpload encounterId={id} onSuccess={() => refetch()} />
          <RadiologyUpload encounterId={id} onSuccess={() => refetch()} />
        </motion.div>
      </div>

      {/* Workflow Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl border border-border p-5"
      >
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-careflow-teal" />
          Next Steps
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return action.available ? (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 hover:bg-muted p-4 text-center transition-all hover:shadow-sm group"
              >
                <Icon
                  className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`}
                />
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </Link>
            ) : (
              <div
                key={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-4 text-center opacity-40 cursor-not-allowed"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  Complete previous steps
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Artifacts */}
      {encounter.artifacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4">
            Uploaded Artifacts ({encounter.artifacts.length})
          </h2>
          <div className="space-y-2">
            {encounter.artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {artifact.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {artifact.artifact_type} · {(artifact.file_size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
                {artifact.storage_url && (
                  <a
                    href={artifact.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-medium text-careflow-teal hover:underline flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-careflow-teal/10 hover:bg-careflow-teal/20 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View File
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
