"use client";

import { Encounter } from "@/types/encounter";
import { EncounterStatusBadge } from "./EncounterStatusBadge";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import { Calendar, User, ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface EncounterCardProps {
  encounter: Encounter;
  index?: number;
}

export function EncounterCard({ encounter, index = 0 }: EncounterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/encounters/${encounter.id}`}
        className="block glass-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-careflow-teal/5 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Patient avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-careflow-teal/10 flex items-center justify-center">
              <span className="text-sm font-bold text-careflow-teal">
                {encounter.patient?.full_name?.[0] ?? "P"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {encounter.patient?.full_name ?? "Unknown Patient"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {encounter.chief_complaint ?? "No chief complaint recorded"}
              </p>
            </div>
          </div>
          <EncounterStatusBadge status={encounter.status} size="md" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDateTime(encounter.created_at)}</span>
          </div>
          {encounter.patient?.age && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>
                {encounter.patient.age} yrs · {encounter.patient.gender ?? "N/A"}
              </span>
            </div>
          )}
          {encounter.patient?.contact_number && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{encounter.patient.contact_number}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-muted-foreground">
            <span>Updated {formatRelativeTime(encounter.updated_at)}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
