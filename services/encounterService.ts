import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Encounter, EncounterCreate } from "@/types/encounter";

export const encounterService = {
  async createEncounter(payload: EncounterCreate): Promise<Encounter> {
    try {
      const { data } = await api.post<{ success: boolean; data: Encounter }>(
        "/encounters",
        payload
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.warn("API createEncounter failed, inserting directly to Supabase:", err);
    }

    // Direct Supabase fallback
    const { data: newEnc, error } = await supabase
      .from("encounters")
      .insert([
        {
          patient_id: payload.patient_id,
          chief_complaint: payload.chief_complaint || "Medical Encounter",
          status: "CREATED",
        },
      ])
      .select("*")
      .single();

    if (error || !newEnc) {
      throw new Error(error?.message || "Failed to create encounter in database");
    }

    return {
      id: newEnc.id,
      patient_id: newEnc.patient_id,
      doctor_id: newEnc.doctor_id || "",
      status: newEnc.status || "CREATED",
      chief_complaint: newEnc.chief_complaint,
      artifacts: [],
      step_results: [],
      created_at: newEnc.created_at,
      updated_at: newEnc.updated_at || newEnc.created_at,
    };
  },

  async listEncounters(patientId?: string): Promise<Encounter[]> {
    // 1. Try remote API first
    try {
      const params = patientId ? { patient_id: patientId } : {};
      const { data } = await api.get<{ success: boolean; data: Encounter[] }>(
        "/encounters",
        { params }
      );
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    } catch (err) {
      console.warn("API listEncounters failed or unauthenticated, querying Supabase database directly:", err);
    }

    // 2. Query Supabase database directly
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

      if (error) {
        console.error("Supabase encounters query error:", error);
        return [];
      }

      if (!encountersData || encountersData.length === 0) {
        return [];
      }

      // Fetch artifacts and step_results for these encounters
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
          storage_url: art.file_url || art.storage_path,
          created_at: art.created_at,
        });
      });

      const stepResultsMap: Record<string, any[]> = {};
      (stepResultsRes.data || []).forEach((sr) => {
        if (!stepResultsMap[sr.encounter_id]) stepResultsMap[sr.encounter_id] = [];
        stepResultsMap[sr.encounter_id].push({
          id: sr.id,
          service_name: sr.service_name || "CLINICAL",
          status: sr.status,
          structured_data: sr.structured_data,
          created_at: sr.created_at,
        });
      });

      return encountersData.map((e: any) => ({
        id: e.id,
        patient_id: e.patient_id,
        doctor_id: e.doctor_id || "",
        status: e.status || "COMPLETED",
        chief_complaint: e.chief_complaint && e.chief_complaint !== "string" ? e.chief_complaint : "Medical Encounter",
        patient: e.patients ? {
          id: e.patients.id,
          mrn: e.patients.mrn || "MRN-000000",
          full_name: e.patients.full_name || "Patient",
          age: e.patients.age || 30,
          gender: e.patients.gender || "Male",
          contact_number: e.patients.contact_number || "",
          created_at: e.patients.created_at || e.created_at,
        } : undefined,
        artifacts: artifactsMap[e.id] || [],
        step_results: stepResultsMap[e.id] || [],
        created_at: e.created_at,
        updated_at: e.updated_at || e.created_at,
      }));
    } catch (dbErr) {
      console.error("Direct database query exception:", dbErr);
      return [];
    }
  },

  async getEncounter(encounterId: string): Promise<Encounter> {
    // 1. Try API first
    try {
      const { data } = await api.get<{ success: boolean; data: Encounter }>(
        `/encounters/${encounterId}`
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.warn(`API getEncounter(${encounterId}) failed, querying Supabase directly:`, err);
    }

    // 2. Direct Supabase query
    const { data: enc, error } = await supabase
      .from("encounters")
      .select(`
        *,
        patients (*)
      `)
      .eq("id", encounterId)
      .single();

    if (error || !enc) {
      throw new Error(`Encounter ${encounterId} not found in database`);
    }

    const [artifactsRes, stepResultsRes] = await Promise.all([
      supabase.from("encounter_artifacts").select("*").eq("encounter_id", encounterId),
      supabase.from("encounter_step_results").select("*").eq("encounter_id", encounterId),
    ]);

    return {
      id: enc.id,
      patient_id: enc.patient_id,
      doctor_id: enc.doctor_id || "",
      status: enc.status || "COMPLETED",
      chief_complaint: enc.chief_complaint && enc.chief_complaint !== "string" ? enc.chief_complaint : "Medical Encounter",
      patient: enc.patients ? {
        id: enc.patients.id,
        mrn: enc.patients.mrn || "MRN-000000",
        full_name: enc.patients.full_name || "Patient",
        age: enc.patients.age || 30,
        gender: enc.patients.gender || "Male",
        contact_number: enc.patients.contact_number || "",
        created_at: enc.patients.created_at || enc.created_at,
      } : undefined,
      artifacts: (artifactsRes.data || []).map((art) => ({
        id: art.id,
        artifact_type: art.artifact_type,
        filename: art.filename,
        mime_type: art.mime_type,
        file_size_bytes: art.file_size_bytes,
        storage_url: art.file_url || art.storage_path,
        created_at: art.created_at,
      })),
      step_results: (stepResultsRes.data || []).map((sr) => ({
        id: sr.id,
        service_name: sr.service_name || "CLINICAL",
        status: sr.status,
        structured_data: sr.structured_data,
        created_at: sr.created_at,
      })),
      created_at: enc.created_at,
      updated_at: enc.updated_at || enc.created_at,
    };
  },
};
