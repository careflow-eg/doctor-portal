"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { Users, ArrowRight, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

import { patientService } from "@/services/patientService";

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.listPatients(),
  });

  if (isLoading) return <PageLoader label="Loading patients..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} registered patients`}
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients yet"
          description="Create an encounter to register a patient."
          action={
            <Link
              href="/encounters"
              className="flex items-center gap-2 rounded-xl bg-careflow-teal text-white px-4 py-2.5 text-sm font-medium hover:bg-careflow-teal-hover transition-all"
            >
              Go to Encounters
            </Link>
          }
        />
      ) : (
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-careflow-teal/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-careflow-teal">
                      {patient.full_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{patient.full_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{patient.mrn}</span>
                      {patient.age && <span>· {patient.age} yrs</span>}
                      {patient.gender && <span>· {patient.gender}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 ml-4">
                  {patient.contact_number && (
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {patient.contact_number}
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Registered: {patient.created_at ? formatDate(patient.created_at) : "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
