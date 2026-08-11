import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Encounter, EncounterCreate } from "@/types/encounter";

export const encounterService = {
  async createEncounter(payload: EncounterCreate): Promise<Encounter> {
    // 1. Try remote API first
    try {
      const { data } = await api.post<{ success: boolean; data: Encounter }>(
        "/encounters",
        payload
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.warn("Remote API createEncounter failed, inserting into Supabase database:", err);
    }

    // 2. Insert into Supabase database
    const encounterId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `enc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const { data: newEnc, error } = await supabase
      .from("encounters")
      .insert([
        {
          id: encounterId,
          patient_id: payload.patient_id,
          chief_complaint: payload.chief_complaint || "Medical Encounter",
          status: "CREATED",
          created_at: now,
          updated_at: now,
        },
      ])
      .select("*")
      .single();

    if (error || !newEnc) {
      throw new Error(error?.message || "Failed to create encounter in database");
    }

    const { data: patientData } = await supabase
      .from("patients")
      .select("*")
      .eq("id", payload.patient_id)
      .single();

    return {
      id: newEnc.id,
      patient_id: newEnc.patient_id,
      doctor_id: newEnc.doctor_id || "",
      status: newEnc.status || "CREATED",
      chief_complaint: newEnc.chief_complaint,
      patient: patientData ? {
        id: patientData.id,
        mrn: patientData.mrn,
        full_name: patientData.full_name,
        age: patientData.age,
        gender: patientData.gender,
        contact_number: patientData.contact_number,
        created_at: patientData.created_at,
      } : undefined,
      artifacts: [],
      step_results: [],
      created_at: newEnc.created_at,
      updated_at: newEnc.updated_at || newEnc.created_at,
    };
  },

  async listEncounters(patientId?: string): Promise<Encounter[]> {
    // 1. Fetch real encounters directly from Supabase Database
    try {
      let query = supabase
        .from("encounters")
        .select(`
          *,
          patients (*)
        `)
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data: encountersData, error } = await query;

      if (!error && encountersData && encountersData.length > 0) {
        const encounterIds = encountersData.map((e) => e.id);
        const [artifactsRes, stepResultsRes] = await Promise.all([
          supabase.from("encounter_artifacts").select("*").in("encounter_id", encounterIds),
          supabase.from("encounter_step_results").select("*").in("encounter_id", encounterIds),
        ]);

        const artifactsMap: Record<string, any[]> = {};
        (artifactsRes.data || []).forEach((art) => {
          if (!artifactsMap[art.encounter_id]) artifactsMap[art.encounter_id] = [];
          artifactsMap[art.encounter_id].push({
            id: art.id,
            artifact_type: art.artifact_type,
            filename: art.filename,
            mime_type: art.mime_type,
            file_size_bytes: art.file_size_bytes,
            storage_path: art.storage_path,
            file_url: art.file_url,
            created_at: art.created_at,
          });
        });

        const stepResultsMap: Record<string, any[]> = {};
        (stepResultsRes.data || []).forEach((sr) => {
          if (!stepResultsMap[sr.encounter_id]) stepResultsMap[sr.encounter_id] = [];
          stepResultsMap[sr.encounter_id].push({
            id: sr.id,
            service_name: sr.service_name,
            status: sr.status,
            structured_data: sr.structured_data,
            error_message: sr.error_message,
            execution_time_ms: sr.execution_time_ms,
            created_at: sr.created_at,
          });
        });

        return encountersData.map((e) => ({
          id: e.id,
          patient_id: e.patient_id,
          doctor_id: e.doctor_id || "",
          status: e.status || "CREATED",
          chief_complaint: e.chief_complaint || "Medical Encounter",
          patient: e.patients ? {
            id: e.patients.id,
            mrn: e.patients.mrn,
            full_name: e.patients.full_name,
            age: e.patients.age,
            gender: e.patients.gender,
            contact_number: e.patients.contact_number,
            created_at: e.patients.created_at,
          } : undefined,
          artifacts: artifactsMap[e.id] || [],
          step_results: stepResultsMap[e.id] || [],
          created_at: e.created_at,
          updated_at: e.updated_at || e.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase listEncounters failed, falling back to remote API:", err);
    }

    // 2. Secondary fallback to remote API
    try {
      const params = patientId ? { patient_id: patientId } : {};
      const { data } = await api.get<{ success: boolean; data: Encounter[] }>(
        "/encounters",
        { params }
      );
      return data.data ?? [];
    } catch (apiErr) {
      console.error("API listEncounters failed:", apiErr);
      return [];
    }
  },

  async getEncounter(encounterId: string): Promise<Encounter> {
    // 1. Fetch encounter details from Supabase Database
    try {
      const { data: enc, error } = await supabase
        .from("encounters")
        .select(`
          *,
          patients (*)
        `)
        .eq("id", encounterId)
        .single();

      if (!error && enc) {
        const [artifactsRes, stepResultsRes] = await Promise.all([
          supabase.from("encounter_artifacts").select("*").eq("encounter_id", encounterId),
          supabase.from("encounter_step_results").select("*").eq("encounter_id", encounterId),
        ]);

        return {
          id: enc.id,
          patient_id: enc.patient_id,
          doctor_id: enc.doctor_id || "",
          status: enc.status || "CREATED",
          chief_complaint: enc.chief_complaint || "Medical Encounter",
          patient: enc.patients ? {
            id: enc.patients.id,
            mrn: enc.patients.mrn,
            full_name: enc.patients.full_name,
            age: enc.patients.age,
            gender: enc.patients.gender,
            contact_number: enc.patients.contact_number,
            created_at: enc.patients.created_at,
          } : undefined,
          artifacts: (artifactsRes.data || []).map((art) => ({
            id: art.id,
            artifact_type: art.artifact_type,
            filename: art.filename,
            mime_type: art.mime_type,
            file_size_bytes: art.file_size_bytes,
            storage_path: art.storage_path,
            file_url: art.file_url,
            created_at: art.created_at,
          })),
          step_results: (stepResultsRes.data || []).map((sr) => ({
            id: sr.id,
            service_name: sr.service_name,
            status: sr.status,
            structured_data: sr.structured_data,
            error_message: sr.error_message,
            execution_time_ms: sr.execution_time_ms,
            created_at: sr.created_at,
          })),
          created_at: enc.created_at,
          updated_at: enc.updated_at || enc.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getEncounter failed, falling back to remote API:", err);
    }

    // 2. Secondary fallback to remote API
    const { data } = await api.get<{ success: boolean; data: Encounter }>(
      `/encounters/${encounterId}`
    );
    return data.data!;
  },
};
