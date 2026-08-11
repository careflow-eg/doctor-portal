"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { encounterService } from "@/services/encounterService";
import { patientService } from "@/services/patientService";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { Users, ArrowRight, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function PatientsPage() {
  const { data: encounters = [], isLoading: isEncLoading } = useQuery({
    queryKey: ["encounters"],
    queryFn: () => encounterService.listEncounters(),
  });

  const { data: allDbPatients = [], isLoading: isPatientsLoading } = useQuery({
    queryKey: ["all-patients"],
    queryFn: () => patientService.listPatients(),
  });

  if (isEncLoading || isPatientsLoading) return <PageLoader label="Loading registered patients..." />;

  // Deduplicate patients from encounters & DB patients list
  const patientMap = new Map<string, { id: string; name: string; mrn: string; age: number; gender: string; phone: string; lastVisit: string; encounterCount: number }>();

  for (const enc of encounters) {
    if (enc.patient) {
      const existing = patientMap.get(enc.patient_id);
      if (!existing) {
        patientMap.set(enc.patient_id, {
          id: enc.patient.id,
          name: enc.patient.full_name,
          mrn: enc.patient.mrn,
          age: enc.patient.age || 30,
          gender: enc.patient.gender || "Male",
          phone: enc.patient.contact_number || "",
          lastVisit: enc.created_at,
          encounterCount: 1,
        });
      } else {
        existing.encounterCount++;
        if (enc.created_at > existing.lastVisit) {
          existing.lastVisit = enc.created_at;
        }
      }
    }
  }

  for (const p of allDbPatients) {
    if (!patientMap.has(p.id)) {
      patientMap.set(p.id, {
        id: p.id,
        name: p.full_name,
        mrn: p.mrn,
        age: p.age || 30,
        gender: p.gender || "Male",
        phone: p.contact_number || "",
        lastVisit: p.created_at,
        encounterCount: 0,
      });
    }
  }

  const patients = Array.from(patientMap.values()).sort(
    (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} registered patients in database`}
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
              Start Encounter
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl border border-border p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{item.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.mrn}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-careflow-teal/10 text-careflow-teal border border-careflow-teal/20">
                    {item.encounterCount} {item.encounterCount === 1 ? "Encounter" : "Encounters"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  <p>Demographics: {item.age} yrs • {item.gender}</p>
                  {item.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3 text-muted-foreground shrink-0" />
                      {item.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 pt-1">
                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                    Last encounter: {formatDate(item.lastVisit)}
                  </p>
                </div>
              </div>

              <Link
                href={`/encounters?patient_id=${item.id}`}
                className="flex items-center justify-between text-xs font-semibold text-careflow-teal hover:underline pt-2 border-t border-border/50"
              >
                <span>View Encounters</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
