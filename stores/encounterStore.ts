import { create } from "zustand";
import { Encounter, WorkflowStep, EncounterStatus } from "@/types/encounter";

const WORKFLOW_STEPS: Omit<WorkflowStep, "status">[] = [
  { id: "create", label: "Create Encounter", description: "Patient registered" },
  { id: "lab", label: "Lab Report", description: "Upload lab results" },
  { id: "radiology", label: "Radiology", description: "Upload imaging" },
  { id: "history", label: "History", description: "AI history collection" },
  { id: "dashboard", label: "Dashboard", description: "Generate clinical dashboard" },
  { id: "review", label: "Review", description: "Doctor reviews AI output" },
  { id: "assistant", label: "AI Assistant", description: "Query AI physician" },
  { id: "complete", label: "Complete", description: "Encounter finalized" },
];

function getWorkflowSteps(status: EncounterStatus): WorkflowStep[] {
  const statusOrder: EncounterStatus[] = [
    "CREATED",
    "LAB_UPLOADED",
    "RADIOLOGY_UPLOADED",
    "HISTORY_IN_PROGRESS",
    "HISTORY_COMPLETED",
    "DASHBOARD_GENERATED",
    "COMPLETED",
  ];

  const stepStatusMap: Record<string, EncounterStatus[]> = {
    create: ["CREATED", "LAB_UPLOADED", "RADIOLOGY_UPLOADED", "HISTORY_IN_PROGRESS", "HISTORY_COMPLETED", "DASHBOARD_GENERATED", "COMPLETED"],
    lab: ["LAB_UPLOADED", "RADIOLOGY_UPLOADED", "HISTORY_IN_PROGRESS", "HISTORY_COMPLETED", "DASHBOARD_GENERATED", "COMPLETED"],
    radiology: ["RADIOLOGY_UPLOADED", "HISTORY_IN_PROGRESS", "HISTORY_COMPLETED", "DASHBOARD_GENERATED", "COMPLETED"],
    history: ["HISTORY_COMPLETED", "DASHBOARD_GENERATED", "COMPLETED"],
    dashboard: ["DASHBOARD_GENERATED", "COMPLETED"],
    review: ["DASHBOARD_GENERATED", "COMPLETED"],
    assistant: ["DASHBOARD_GENERATED", "COMPLETED"],
    complete: ["COMPLETED"],
  };

  const currentIdx = statusOrder.indexOf(status);

  return WORKFLOW_STEPS.map((step) => {
    const completedStatuses = stepStatusMap[step.id] ?? [];
    if (completedStatuses.includes(status)) {
      return { ...step, status: "completed" };
    }
    // Active: the next uncompleted step
    if (step.id === "history" && (status === "HISTORY_IN_PROGRESS")) {
      return { ...step, status: "active" };
    }
    return { ...step, status: "pending" };
  });
}

interface EncounterState {
  activeEncounter: Encounter | null;
  workflowSteps: WorkflowStep[];
  setActiveEncounter: (encounter: Encounter) => void;
  clearActiveEncounter: () => void;
}

export const useEncounterStore = create<EncounterState>((set) => ({
  activeEncounter: null,
  workflowSteps: WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" as const })),

  setActiveEncounter: (encounter: Encounter) => {
    set({
      activeEncounter: encounter,
      workflowSteps: getWorkflowSteps(encounter.status),
    });
  },

  clearActiveEncounter: () => {
    set({
      activeEncounter: null,
      workflowSteps: WORKFLOW_STEPS.map((s) => ({ ...s, status: "pending" as const })),
    });
  },
}));
