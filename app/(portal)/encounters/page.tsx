"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { EncounterCard } from "@/components/encounters/EncounterCard";
import { CreateEncounterModal } from "@/components/encounters/CreateEncounterModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { EncounterStatus } from "@/types/encounter";
import { PlusCircle, ClipboardList, Search } from "lucide-react";

const STATUS_FILTERS: { label: string; value: EncounterStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "CREATED" },
  { label: "History", value: "HISTORY_IN_PROGRESS" },
  { label: "Dashboard", value: "DASHBOARD_GENERATED" },
  { label: "Completed", value: "COMPLETED" },
];

export default function EncountersPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EncounterStatus | "ALL">("ALL");

  const { data: encounters = [], isLoading } = useQuery({
    queryKey: ["encounters"],
    queryFn: () => encounterService.listEncounters(),
    refetchInterval: 15000,
  });

  if (isLoading) return <PageLoader label="Loading encounters..." />;

  const filtered = encounters
    .filter((e) => statusFilter === "ALL" || e.status === statusFilter)
    .filter(
      (e) =>
        !search ||
        e.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        e.chief_complaint?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Encounters"
        subtitle={`${encounters.length} total encounters`}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white px-4 py-2.5 text-sm font-medium transition-all shadow-md shadow-careflow-teal/20 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            New Encounter
          </button>
        }
      />

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or complaint..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? "bg-careflow-teal text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No encounters found"
          description={
            search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter."
              : "Create your first encounter to get started."
          }
          action={
            !search && statusFilter === "ALL" ? (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl bg-careflow-teal text-white px-4 py-2.5 text-sm font-medium hover:bg-careflow-teal-hover transition-all"
              >
                <PlusCircle className="h-4 w-4" /> New Encounter
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((enc, i) => (
            <EncounterCard key={enc.id} encounter={enc} index={i} />
          ))}
        </div>
      )}

      <CreateEncounterModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
