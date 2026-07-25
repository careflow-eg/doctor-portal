"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AssistantPage() {
  const { data: encounters = [], isLoading } = useQuery({
    queryKey: ["encounters"],
    queryFn: () => encounterService.listEncounters(),
  });

  const withDashboard = encounters.filter(
    (e) => e.status === "DASHBOARD_GENERATED" || e.status === "COMPLETED"
  );

  if (isLoading) return <PageLoader label="Loading encounters..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI Physician Assistant"
        subtitle="Select an encounter to query the AI assistant"
      />

      {withDashboard.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No eligible encounters"
          description="Generate a clinical dashboard for an encounter first, then you can use the AI assistant for that encounter."
          action={
            <Link
              href="/encounters"
              className="flex items-center gap-2 rounded-xl bg-careflow-teal text-white px-4 py-2.5 text-sm font-medium hover:bg-careflow-teal-hover transition-all"
            >
              View Encounters
            </Link>
          }
        />
      ) : (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Bot className="h-5 w-5 text-careflow-teal" />
            <h2 className="font-semibold text-foreground">Encounters with AI Dashboard</h2>
            <span className="text-xs bg-careflow-teal/10 text-careflow-teal px-2 py-0.5 rounded-full ml-auto">
              {withDashboard.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {withDashboard.map((enc) => (
              <Link
                key={enc.id}
                href={`/encounters/${enc.id}/assistant`}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-careflow-teal/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-careflow-teal">
                      {enc.patient?.full_name?.[0] ?? "P"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {enc.patient?.full_name ?? "Unknown Patient"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enc.chief_complaint ?? "No complaint recorded"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-careflow-teal transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
