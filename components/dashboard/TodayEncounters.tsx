"use client";

import { Encounter } from "@/types/encounter";
import { formatRelativeTime } from "@/lib/utils";
import { EncounterStatusBadge } from "@/components/encounters/EncounterStatusBadge";
import { ClipboardList, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TodayEncountersProps {
  encounters: Encounter[];
}

export function TodayEncounters({ encounters }: TodayEncountersProps) {
  const today = encounters.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-careflow-teal" />
          <h2 className="font-semibold text-foreground">Today&apos;s Encounters</h2>
          <span className="text-xs bg-careflow-teal/10 text-careflow-teal px-2 py-0.5 rounded-full font-medium">
            {today.length}
          </span>
        </div>
        <Link
          href="/encounters"
          className="text-xs text-careflow-teal hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {today.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No encounters today</p>
            <Link
              href="/encounters?create=true"
              className="mt-3 inline-flex items-center gap-1 text-sm text-careflow-teal hover:underline"
            >
              Create first encounter
            </Link>
          </div>
        ) : (
          today.slice(0, 5).map((enc, i) => (
            <motion.div
              key={enc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/encounters/${enc.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-careflow-teal/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-careflow-teal">
                      {enc.patient?.full_name?.[0] ?? "P"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {enc.patient?.full_name ?? "Unknown Patient"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enc.chief_complaint ?? "No chief complaint"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <EncounterStatusBadge status={enc.status} />
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatRelativeTime(enc.created_at)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
