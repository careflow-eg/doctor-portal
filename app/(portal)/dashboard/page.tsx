"use client";

import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayEncounters } from "@/components/dashboard/TodayEncounters";
import { PendingItems } from "@/components/dashboard/PendingItems";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { PlusCircle, Users, ClipboardList, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection, AnimatedCard } from "@/components/layout/AnimatedWrapper";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: encounters = [], isLoading } = useQuery({
    queryKey: ["encounters"],
    queryFn: () => encounterService.listEncounters(),
    refetchInterval: 30000, // refresh every 30 seconds
  });

  if (isLoading) return <PageLoader label="Loading dashboard..." />;

  const active = encounters.filter(
    (e) => e.status !== "COMPLETED"
  ).length;

  const pendingHistory = encounters.filter(
    (e) => ["CREATED", "LAB_UPLOADED", "RADIOLOGY_UPLOADED"].includes(e.status)
  ).length;

  // Get unique patients
  const uniquePatients = new Set(encounters.map((e) => e.patient_id)).size;

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <PageHeader
          title={`Good morning, ${user?.full_name?.split(" ")[0] ?? "Doctor"} 👋`}
        subtitle="Here's your clinical overview for today"
        actions={
          <Link
            href="/encounters?create=true"
            className="flex items-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white px-4 py-2.5 text-sm font-medium transition-all shadow-md shadow-careflow-teal/20 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            New Encounter
          </Link>
        }
      />
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection className="delay-100">
        <StatsCards
          totalPatients={uniquePatients}
          totalEncounters={encounters.length}
          activeEncounters={active}
          pendingHistory={pendingHistory}
        />
      </AnimatedSection>

      {/* Two-column grid */}
      <AnimatedSection className="grid grid-cols-1 lg:grid-cols-3 gap-6 delay-200">
        <div className="lg:col-span-2">
          <TodayEncounters encounters={encounters} />
        </div>
        <div>
          <PendingItems encounters={encounters} />
        </div>
      </AnimatedSection>

      {/* Quick actions */}
      <AnimatedCard
        delay={0.4}
        className="glass-card rounded-2xl border border-border p-5"
      >
        <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/encounters?create=true", label: "New Encounter", icon: PlusCircle, color: "text-careflow-teal" },
            { href: "/encounters", label: "All Encounters", icon: ClipboardList, color: "text-blue-500" },
            { href: "/patients", label: "Patients", icon: Users, color: "text-purple-500" },
            { href: "/assistant", label: "AI Assistant", icon: Activity, color: "text-amber-500" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 hover:bg-muted p-4 text-center transition-all hover:shadow-sm group"
              >
                <Icon className={`h-6 w-6 ${a.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </AnimatedCard>
    </div>
  );
}
