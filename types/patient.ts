// Patient types matching workflow_orchestrator schemas/patient.py

export interface Patient {
  id: string;
  mrn: string;
  full_name: string;
  age?: number;
  gender?: string;
  contact_number?: string;
  created_at?: string;
}

export interface PatientCreate {
  mrn: string;
  full_name: string;
  age?: number;
  gender?: string;
  contact_number?: string;
}
