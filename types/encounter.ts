// Encounter types matching workflow_orchestrator schemas/encounter.py
import { Patient } from "./patient";

export type EncounterStatus =
  | "CREATED"
  | "LAB_UPLOADED"
  | "RADIOLOGY_UPLOADED"
  | "HISTORY_IN_PROGRESS"
  | "HISTORY_COMPLETED"
  | "DASHBOARD_GENERATED"
  | "COMPLETED";

export type ArtifactType = "LAB_REPORT" | "RADIOLOGY_IMAGE" | "AUDIO";

export type ServiceName =
  | "LAB_OCR"
  | "RADIOLOGY"
  | "HISTORY"
  | "DECISION_SUPPORT";

export interface Artifact {
  id: string;
  artifact_type: ArtifactType;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_url?: string;
  created_at: string;
}

export interface StepResult {
  id: string;
  service_name: ServiceName;
  status: string;
  structured_data?: Record<string, unknown>;
  created_at: string;
}

export interface Encounter {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: EncounterStatus;
  chief_complaint?: string;
  conversation_id?: string;
  patient?: Patient;
  artifacts: Artifact[];
  step_results: StepResult[];
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface EncounterCreate {
  patient_id: string;
  chief_complaint?: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "completed" | "skipped";
}
