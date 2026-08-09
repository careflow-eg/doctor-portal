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

type RawData = Record<string, any>;

export function normalizeDashboardData(
  raw: RawData,
  encounter?: RawData
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
    allergies = raw.allergies.map((a: string) => formatText(a));
  } else if (Array.isArray(rawDemographics.allergies)) {
    allergies = rawDemographics.allergies.map((a: string) => formatText(a));
  } else if (Array.isArray(raw.history?.allergies)) {
    // This branch handles the structured shape, where each entry is an object
    // rather than a plain string. Annotating it `string` made the object branch
    // unreachable to the type checker (`a` narrowed to `never`), so the union is
    // what the code has always actually accepted.
    type RawAllergy = string | { allergy?: string; name?: string };
    allergies = raw.history.allergies.map((a: RawAllergy) =>
      formatText(typeof a === "object" && a !== null ? a.allergy || a.name : a)
    );
  }

  let current_medications: string[] = [];
  if (Array.isArray(raw.current_medications)) {
    current_medications = raw.current_medications.map((m: string) => formatText(m));
  } else if (Array.isArray(rawDemographics.current_medications)) {
    current_medications = rawDemographics.current_medications.map((m: string) => formatText(m));
  } else if (Array.isArray(raw.history?.medications)) {
    type RawMedication = string | { medication?: string; name?: string };
    current_medications = raw.history.medications.map((m: RawMedication) =>
      formatText(typeof m === "object" && m !== null ? m.medication || m.name : m)
    );
  }

  // 4. Symptoms
  let rawSymptoms = raw.symptoms || raw.history?.symptoms || [];
  if (!Array.isArray(rawSymptoms) && typeof rawSymptoms === "object") {
    rawSymptoms = Object.entries(rawSymptoms).map(([k, v]) => ({ name: k, details: v }));
  }
  const symptoms: Symptom[] = Array.isArray(rawSymptoms)
    ? rawSymptoms.map((s: RawData) => {
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

  // Every call site passes either a raw string flag or a result object carrying
  // one of the fields read below. RawData (Record<string, any>) made the string
  // branch unreachable to the type checker even though it is live at runtime —
  // this union is what the function has always actually accepted.
  type LabStatusInput =
    | string
    | { status?: string; status_icon?: string; severity_level?: string; flag?: string; severity?: string };

  function parseLabStatus(item: LabStatusInput): "normal" | "high" | "low" | "critical" {
    if (!item) return "normal";
    if (typeof item === "string") {
      const s = item.toLowerCase();
      if (s.includes("crit") || s.includes("panic") || s.includes("severe") || s.includes("🔴")) return "critical";
      if (s.includes("high") || s.includes("elevat") || s.includes("abnorm") || s.includes("h") || s.includes("🟡")) return "high";
      if (s.includes("low") || s.includes("decreas") || s.includes("l")) return "low";
      if (s.includes("norm") || s.includes("ok")) return "normal";
      return "normal";
    }
    const statusStr = String(
      item.status || item.status_icon || item.severity_level || item.flag || item.severity || ""
    ).toLowerCase();
    if (statusStr.includes("crit") || statusStr.includes("panic") || statusStr.includes("severe") || statusStr.includes("🔴")) return "critical";
    if (statusStr.includes("high") || statusStr.includes("elevat") || statusStr.includes("abnorm") || statusStr.includes("h") || statusStr.includes("🟡")) return "high";
    if (statusStr.includes("low") || statusStr.includes("decreas") || statusStr.includes("l")) return "low";
    return "normal";
  }

  // 5. Lab Insights
  let lab_insights: LabInsight | undefined;

  let rawLab =
    raw.lab_insights ||
    raw.laboratory ||
    raw.lab_results ||
    raw.lab_findings ||
    raw.labs ||
    raw.lab;

  // Fallback to encounter step_results if raw has no lab data or empty lab array
  if (
    (!rawLab || (Array.isArray(rawLab) && rawLab.length === 0)) &&
    encounter?.step_results &&
    Array.isArray(encounter.step_results)
  ) {
    const labStep = [...encounter.step_results]
      .reverse()
      .find((s: RawData) => (s.service_name === "LAB" || s.service_name === "OCR_MASKING") && s.status === "SUCCESS");
    if (labStep?.structured_data) {
      rawLab = labStep.structured_data;
    }
  }

  if (Array.isArray(rawLab) && rawLab.length > 0) {
    const findings: LabFinding[] = rawLab.map((item: RawData) => {
      if (typeof item === "string") {
        return {
          test_name: formatText(item),
          value: "",
          status: parseLabStatus(item),
        };
      }

      const testName = formatText(
        item.test_name ||
        item.test ||
        item.name ||
        item.label ||
        item.finding ||
        item.title ||
        item.parameter
      );

      const val = formatText(item.value || item.result_value || item.result || item.val || item.details);
      const unit = formatText(item.unit || item.units);
      const referenceRange = formatText(
        item.reference_range || item.reference || item.ref_range || item.range
      );

      return {
        test_name: testName || "Laboratory Finding",
        value: val,
        unit,
        reference_range: referenceRange,
        status: parseLabStatus(item),
      };
    });

    const abnormal_count =
      raw.abnormal_count ??
      raw.abnormal_lab_count ??
      findings.filter((f) => f.status && f.status !== "normal").length;

    const summaryText = formatText(
      raw.lab_summary ||
      raw.laboratory_summary ||
      raw.lab_insights_summary ||
      raw.summary ||
      (findings.length > 0 ? "Laboratory Findings Summary" : undefined)
    );

    lab_insights = {
      summary: summaryText,
      findings,
      abnormal_count,
      interpretation: formatText(raw.lab_interpretation || raw.interpretation || raw.original_report),
    };
  } else if (rawLab && typeof rawLab === "object") {
    let findings: LabFinding[] = [];

    if (Array.isArray(rawLab.findings) && rawLab.findings.length > 0) {
      findings = rawLab.findings.map((f: RawData) => {
        if (typeof f === "string") {
          return { test_name: formatText(f), value: "", status: parseLabStatus(f) };
        }
        return {
          test_name: formatText(
            f.test_name || f.test || f.name || f.label || f.finding || f.title
          ) || "Laboratory Finding",
          value: formatText(f.value || f.result_value || f.result),
          unit: formatText(f.unit || f.units),
          reference_range: formatText(f.reference_range || f.reference || f.ref_range),
          status: parseLabStatus(f),
        };
      });
    } else if (rawLab.structured_results && typeof rawLab.structured_results === "object") {
      findings = Object.entries(rawLab.structured_results).map(([test_name, details]: [string, any]) => {
        if (typeof details === "object" && details !== null) {
          return {
            test_name: formatText(test_name),
            value: formatText(details.value || details.result_value || details.result),
            unit: formatText(details.unit || details.units),
            reference_range: formatText(details.reference_range || details.reference),
            status: parseLabStatus(details),
          };
        }
        return {
          test_name: formatText(test_name),
          value: formatText(details),
          status: "normal" as const,
        };
      });
    } else if (Array.isArray(rawLab.critical_findings) && rawLab.critical_findings.length > 0) {
      findings = rawLab.critical_findings.map((item: RawData) => ({
        test_name: formatText(typeof item === "object" ? item.test_name || item.label || item.finding : item),
        value: formatText(typeof item === "object" ? item.value : ""),
        status: "critical" as const,
      }));
    }

    const abnormal_count =
      rawLab.abnormal_count ??
      raw.abnormal_count ??
      findings.filter((f) => f.status && f.status !== "normal").length;

    const summaryText = formatText(
      rawLab.summary ||
      raw.lab_summary ||
      raw.laboratory_summary ||
      (findings.length > 0 ? "Laboratory Findings Summary" : undefined)
    );

    if (summaryText || findings.length > 0 || rawLab.interpretation || rawLab.original_report) {
      lab_insights = {
        summary: summaryText,
        findings,
        abnormal_count,
        interpretation: formatText(rawLab.interpretation || rawLab.original_report),
      };
    }
  }

  // 6. Radiology Insights
  let rawRad = raw.radiology_insights || raw.radiology_findings || raw.radiology || [];
  if (!Array.isArray(rawRad) && typeof rawRad === "object") {
    rawRad = [rawRad];
  }
  const radiology_insights: RadiologyInsight[] = Array.isArray(rawRad)
    ? rawRad.map((item: RawData) => {
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
    ? rawDiff.map((item: RawData) => {
      if (typeof item === "string") {
        return { diagnosis: item, confidence: undefined };
      }
      // Confidence
      let confidence = undefined;
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
        supporting_evidence = item.supporting_evidence.map((e: string) => formatText(e));
      } else if (item.supporting_evidence && typeof item.supporting_evidence === "object") {
        if (Array.isArray(item.supporting_evidence.positive)) {
          supporting_evidence = item.supporting_evidence.positive.map((e: string) => formatText(e));
        }
        if (Array.isArray(item.supporting_evidence.negative)) {
          against_evidence = item.supporting_evidence.negative.map((e: string) => formatText(e));
        }
      } else if (item.evidence_summary) {
        supporting_evidence = [formatText(item.evidence_summary)];
      }

      if (Array.isArray(item.against_evidence)) {
        against_evidence = item.against_evidence.map((e: string) => formatText(e));
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
    ? rawInv.map((item: RawData) => {
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
    ? rawAct.map((item: RawData) => {
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
