"use client";

import { Encounter } from "@/types/encounter";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, FlaskConical, Brain } from "lucide-react";
import Link from "next/link";

interface PendingItemsProps {
  encounters: Encounter[];
}

export function PendingItems({ encounters }: PendingItemsProps) {
  const pendingHistory = encounters.filter(
    (e) => e.status === "CREATED" || e.status === "LAB_UPLOADED" || e.status === "RADIOLOGY_UPLOADED"
  );
  const pendingDashboard = encounters.filter(
    (e) => e.status === "HISTORY_COMPLETED"
  );

  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold text-foreground">Pending Items</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Pending History */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Awaiting History Collection
            </span>
            {pendingHistory.length > 0 && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {pendingHistory.length}
              </span>
            )}
          </div>
          {pendingHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground pl-6">All caught up! 🎉</p>
          ) : (
            <div className="space-y-1 pl-6">
              {pendingHistory.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  href={`/encounters/${e.id}/history`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground truncate">
                    {e.patient?.full_name ?? "Patient"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {formatRelativeTime(e.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Pending Dashboard */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Awaiting Dashboard Generation
            </span>
            {pendingDashboard.length > 0 && (
              <span className="ml-auto text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded-full">
                {pendingDashboard.length}
              </span>
            )}
          </div>
          {pendingDashboard.length === 0 ? (
            <p className="text-sm text-muted-foreground pl-6">No pending dashboards</p>
          ) : (
            <div className="space-y-1 pl-6">
              {pendingDashboard.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  href={`/encounters/${e.id}/dashboard`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground truncate">
                    {e.patient?.full_name ?? "Patient"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    Generate
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
