// Clinical Dashboard types for AI-generated outputs

export interface Demographics {
  name: string;
  age?: number;
  gender?: string;
  mrn?: string;
}

export interface Symptom {
  name: string;
  severity?: "mild" | "moderate" | "severe";
  duration?: string;
  confidence?: number;
  onset?: string;
}

export interface LabFinding {
  test_name: string;
  value?: string;
  reference_range?: string;
  status?: "normal" | "high" | "low" | "critical";
  unit?: string;
}

export interface LabInsight {
  summary?: string;
  findings?: LabFinding[];
  abnormal_count?: number;
  interpretation?: string;
}

export interface RadiologyInsight {
  modality?: string;
  body_part?: string;
  findings?: string;
  impression?: string;
  clinical_significance?: string;
  confidence?: number;
}

export interface DifferentialDiagnosis {
  diagnosis: string;
  confidence?: number | string;
  icd_code?: string;
  supporting_evidence?: string[];
  against_evidence?: string[];
}

export interface ClinicalCorrelation {
  finding: string;
  source: string;
  significance: string;
}

export interface SuggestedInvestigation {
  investigation: string;
  rationale: string;
  urgency?: "routine" | "urgent" | "stat";
}

export interface SuggestedAction {
  action: string;
  rationale: string;
  priority?: "low" | "medium" | "high";
}

export interface TimelineEvent {
  date?: string;
  event: string;
  type: "symptom" | "lab" | "radiology" | "history" | "diagnosis";
}

export interface ClinicalDashboard {
  // Patient overview
  demographics?: Demographics;
  chief_complaint?: string;
  allergies?: string[];
  current_medications?: string[];

  // Clinical data
  symptoms?: Symptom[];
  timeline?: TimelineEvent[];

  // Insights
  lab_insights?: LabInsight;
  radiology_insights?: RadiologyInsight[];

  // Clinical reasoning
  clinical_correlations?: ClinicalCorrelation[];
  differential_diagnosis?: DifferentialDiagnosis[];

  // Recommendations
  suggested_investigations?: SuggestedInvestigation[];
  suggested_actions?: SuggestedAction[];

  // Metadata
  generated_at?: string;
  confidence_score?: number;
}

// AI Assistant
export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  sources?: string[];
  timestamp: string;
}

export interface AssistantResponse {
  answer?: string;
  response?: string;
  citations?: string[];
  sources?: string[];
  data?: Record<string, unknown>;
}

// WebSocket History events
export type HistoryEventType =
  | "connected"
  | "transcript"
  | "next_question"
  | "interview_completed"
  | "error"
  | "status";

export interface HistoryEvent {
  type: HistoryEventType;
  message?: string;
  question?: string;
  transcript?: TranscriptEntry[];
  data?: Record<string, unknown>;
}

export interface TranscriptEntry {
  role: "patient" | "system" | "assistant";
  content: string;
  timestamp?: string;
}
