import {
  ClinicalDashboard,
  Demographics,
  Symptom,
  LabInsight,
  LabFinding,
  RadiologyInsight,
  DifferentialDiagnosis,
  SuggestedInvestigation,
  SuggestedAction,
} from "@/types/dashboard";
import { formatText } from "./utils";

export function normalizeDashboardData(
  raw: any,
  encounter?: any
): ClinicalDashboard {
  if (!raw || typeof raw !== "object") {
    raw = {};
  }

  // 1. Demographics
  const patient = encounter?.patient;
  const rawDemographics = raw.demographics || raw.patient_overview || {};
  const demographics: Demographics = {
    name:
      formatText(rawDemographics.name) ||
      (patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "") ||
      "Patient",
    age: rawDemographics.age ?? patient?.age,
    gender: rawDemographics.gender || patient?.gender,
    mrn: rawDemographics.mrn || rawDemographics.patient_id || patient?.mrn,
  };

  // 2. Chief Complaint
  let chief_complaint = "";
  if (raw.chief_complaint) {
    if (typeof raw.chief_complaint === "string") {
      chief_complaint = raw.chief_complaint;
    } else if (typeof raw.chief_complaint === "object") {
      chief_complaint =
        raw.chief_complaint.main_complaint ||
        raw.chief_complaint.complaint ||
        raw.chief_complaint.summary ||
        formatText(raw.chief_complaint);
    }
  } else if (rawDemographics.chief_complaint) {
    chief_complaint = formatText(rawDemographics.chief_complaint);
  } else if (encounter?.chief_complaint) {
    chief_complaint = encounter.chief_complaint;
  }

  // 3. Allergies & Medications
  let allergies: string[] = [];
  if (Array.isArray(raw.allergies)) {
    allergies = raw.allergies.map((a: any) => formatText(a));
  } else if (Array.isArray(rawDemographics.allergies)) {
    allergies = rawDemographics.allergies.map((a: any) => formatText(a));
  } else if (Array.isArray(raw.history?.allergies)) {
    allergies = raw.history.allergies.map((a: any) =>
      formatText(typeof a === "object" ? a.allergy || a.name : a)
    );
  }

  let current_medications: string[] = [];
  if (Array.isArray(raw.current_medications)) {
    current_medications = raw.current_medications.map((m: any) => formatText(m));
  } else if (Array.isArray(rawDemographics.current_medications)) {
    current_medications = rawDemographics.current_medications.map((m: any) => formatText(m));
  } else if (Array.isArray(raw.history?.medications)) {
    current_medications = raw.history.medications.map((m: any) =>
      formatText(typeof m === "object" ? m.medication || m.name : m)
    );
  }

  // 4. Symptoms
  let rawSymptoms = raw.symptoms || raw.history?.symptoms || [];
  if (!Array.isArray(rawSymptoms) && typeof rawSymptoms === "object") {
    rawSymptoms = Object.entries(rawSymptoms).map(([k, v]) => ({ name: k, details: v }));
  }
  const symptoms: Symptom[] = Array.isArray(rawSymptoms)
    ? rawSymptoms.map((s: any) => {
        if (typeof s === "string") {
          return { name: s, severity: "moderate" };
        }
        return {
          name: formatText(s.name || s.symptom || s.finding || s.symptom_name),
          severity: (typeof s.severity === "string" ? s.severity.toLowerCase() : "moderate") as any,
          duration: formatText(s.duration),
          confidence:
            typeof s.confidence === "number"
              ? s.confidence
              : typeof s.confidence_score === "number"
              ? s.confidence_score
              : undefined,
          onset: formatText(s.onset),
        };
      })
    : [];

  // 5. Lab Insights
  let lab_insights: LabInsight | undefined;
  const rawLab = raw.lab_insights || raw.laboratory;
  if (Array.isArray(rawLab)) {
    const findings: LabFinding[] = rawLab.map((item: any) => ({
      test_name: formatText(item.test_name || item.test || item.name),
      value: formatText(item.value || item.result_value),
      unit: formatText(item.unit),
      reference_range: formatText(item.reference_range),
      status: (typeof item.status === "string"
        ? item.status.toLowerCase()
        : item.flag
        ? "high"
        : "normal") as any,
    }));
    const abnormal_count = findings.filter((f) => f.status && f.status !== "normal").length;
    lab_insights = {
      summary: "Laboratory Findings Summary",
      findings,
      abnormal_count,
    };
  } else if (rawLab && typeof rawLab === "object") {
    let findings: LabFinding[] = [];
    if (Array.isArray(rawLab.findings)) {
      findings = rawLab.findings.map((f: any) => ({
        test_name: formatText(f.test_name || f.test || f.name),
        value: formatText(f.value || f.result_value),
        unit: formatText(f.unit),
        reference_range: formatText(f.reference_range),
        status: (typeof f.status === "string" ? f.status.toLowerCase() : "normal") as any,
      }));
    } else if (rawLab.structured_results && typeof rawLab.structured_results === "object") {
      findings = Object.entries(rawLab.structured_results).map(([test_name, details]: [string, any]) => ({
        test_name,
        value: formatText(details.value),
        unit: formatText(details.unit),
        reference_range: formatText(details.reference_range),
        status: (details.flag ? "high" : "normal") as any,
      }));
    }
    lab_insights = {
      summary: formatText(rawLab.summary),
      findings,
      abnormal_count:
        rawLab.abnormal_count ?? findings.filter((f) => f.status && f.status !== "normal").length,
      interpretation: formatText(rawLab.interpretation || rawLab.original_report),
    };
  }

  // 6. Radiology Insights
  let rawRad = raw.radiology_insights || raw.radiology_findings || raw.radiology || [];
  if (!Array.isArray(rawRad) && typeof rawRad === "object") {
    rawRad = [rawRad];
  }
  const radiology_insights: RadiologyInsight[] = Array.isArray(rawRad)
    ? rawRad.map((item: any) => {
        if (typeof item === "string") {
          return { findings: item };
        }
        return {
          modality: formatText(item.modality),
          body_part: formatText(item.body_part || item.anatomical_location),
          findings: formatText(item.findings || item.abnormality),
          impression: formatText(item.impression || item.summary || item.ai_impression),
          clinical_significance: formatText(item.clinical_significance || item.severity),
          confidence:
            typeof item.confidence === "number"
              ? item.confidence
              : typeof item.confidence_score === "number"
              ? item.confidence_score
              : undefined,
        };
      })
    : [];

  // 7. Differential Diagnosis
  let rawDiff = raw.differential_diagnosis || raw.differential_diagnoses || [];
  if (!Array.isArray(rawDiff) && typeof rawDiff === "object") {
    rawDiff = [rawDiff];
  }
  const differential_diagnosis: DifferentialDiagnosis[] = Array.isArray(rawDiff)
    ? rawDiff.map((item: any) => {
        if (typeof item === "string") {
          return { diagnosis: item, confidence: 0.8 };
        }
        // Confidence
        let confidence = 0.5;
        if (typeof item.confidence === "number") {
          confidence = item.confidence > 1 ? item.confidence / 100 : item.confidence;
        } else if (typeof item.confidence_score === "number") {
          confidence = item.confidence_score > 1 ? item.confidence_score / 100 : item.confidence_score;
        } else if (typeof item.confidence_level === "string") {
          const lvl = item.confidence_level.toLowerCase();
          if (lvl.includes("high")) confidence = 0.85;
          else if (lvl.includes("med")) confidence = 0.65;
          else if (lvl.includes("low")) confidence = 0.45;
        }

        // Supporting / Against evidence
        let supporting_evidence: string[] = [];
        let against_evidence: string[] = [];

        if (Array.isArray(item.supporting_evidence)) {
          supporting_evidence = item.supporting_evidence.map((e: any) => formatText(e));
        } else if (item.supporting_evidence && typeof item.supporting_evidence === "object") {
          if (Array.isArray(item.supporting_evidence.positive)) {
            supporting_evidence = item.supporting_evidence.positive.map((e: any) => formatText(e));
          }
          if (Array.isArray(item.supporting_evidence.negative)) {
            against_evidence = item.supporting_evidence.negative.map((e: any) => formatText(e));
          }
        } else if (item.evidence_summary) {
          supporting_evidence = [formatText(item.evidence_summary)];
        }

        if (Array.isArray(item.against_evidence)) {
          against_evidence = item.against_evidence.map((e: any) => formatText(e));
        }

        return {
          diagnosis: formatText(item.diagnosis || item.condition || item.name),
          confidence,
          icd_code: formatText(item.icd_code || item.icd10_code),
          supporting_evidence,
          against_evidence,
        };
      })
    : [];

  // 8. Suggested Investigations
  let rawInv = raw.suggested_investigations || [];
  if (!Array.isArray(rawInv) && typeof rawInv === "object") {
    rawInv = Object.values(rawInv);
  }
  const suggested_investigations: SuggestedInvestigation[] = Array.isArray(rawInv)
    ? rawInv.map((item: any) => {
        if (typeof item === "string") {
          return { investigation: item, rationale: "", urgency: "routine" };
        }
        return {
          investigation: formatText(item.investigation || item.name || item.text || item.title),
          rationale: formatText(item.rationale || item.reason || item.description),
          urgency: (typeof item.urgency === "string" ? item.urgency.toLowerCase() : "routine") as any,
        };
      })
    : [];

  // 9. Suggested Actions
  let rawAct =
    raw.suggested_actions || raw.suggested_clinical_actions || raw.recommended_treatment_plan || [];
  if (!Array.isArray(rawAct) && typeof rawAct === "object") {
    rawAct = Object.values(rawAct);
  }
  const suggested_actions: SuggestedAction[] = Array.isArray(rawAct)
    ? rawAct.map((item: any) => {
        if (typeof item === "string") {
          return { action: item, rationale: "", priority: "medium" };
        }
        return {
          action: formatText(item.action || item.name || item.text || item.title),
          rationale: formatText(item.rationale || item.reason || item.description),
          priority: (typeof item.priority === "string" ? item.priority.toLowerCase() : "medium") as any,
        };
      })
    : [];

  return {
    demographics,
    chief_complaint,
    allergies,
    current_medications,
    symptoms,
    lab_insights,
    radiology_insights,
    differential_diagnosis,
    suggested_investigations,
    suggested_actions,
    generated_at: raw.generated_at,
    confidence_score: raw.confidence_score,
  };
}
