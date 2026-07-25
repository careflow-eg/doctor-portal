"use client";

import { EncounterStatus } from "@/types/encounter";
import { cn } from "@/lib/utils";

interface EncounterStatusBadgeProps {
  status: EncounterStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  EncounterStatus,
  { label: string; className: string }
> = {
  CREATED: {
    label: "Created",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  LAB_UPLOADED: {
    label: "Lab Uploaded",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  RADIOLOGY_UPLOADED: {
    label: "Radiology Done",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  },
  HISTORY_IN_PROGRESS: {
    label: "History Active",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  HISTORY_COMPLETED: {
    label: "History Done",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  },
  DASHBOARD_GENERATED: {
    label: "Dashboard Ready",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
};

export function EncounterStatusBadge({ status, size = "sm" }: EncounterStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.className
      )}
    >
      {size === "md" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-current opacity-60" />
      )}
      {config.label}
    </span>
  );
}
