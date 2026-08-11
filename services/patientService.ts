import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Patient, PatientCreate } from "@/types/patient";

export const patientService = {
  async createPatient(payload: PatientCreate): Promise<Patient> {
    try {
      const { data } = await api.post<{ success: boolean; data: Patient }>(
        "/patients",
        payload
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.warn("Remote API createPatient failed, inserting into Supabase database:", err);
    }

    const patientId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const { data: newPatient, error } = await supabase
      .from("patients")
      .insert([
        {
          id: patientId,
          mrn,
          full_name: payload.full_name,
          age: payload.age || 30,
          gender: payload.gender || "unspecified",
          contact_number: payload.contact_number || "",
          created_at: now,
          updated_at: now,
        },
      ])
      .select("*")
      .single();

    if (error || !newPatient) {
      throw new Error(error?.message || "Failed to create patient in database");
    }

    return {
      id: newPatient.id,
      mrn: newPatient.mrn,
      full_name: newPatient.full_name,
      age: newPatient.age,
      gender: newPatient.gender,
      contact_number: newPatient.contact_number,
      created_at: newPatient.created_at,
    };
  },

  async getPatient(patientId: string): Promise<Patient> {
    try {
      const { data: p, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (!error && p) {
        return {
          id: p.id,
          mrn: p.mrn,
          full_name: p.full_name,
          age: p.age,
          gender: p.gender,
          contact_number: p.contact_number,
          created_at: p.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase getPatient failed, falling back to remote API:", err);
    }

    const { data } = await api.get<{ success: boolean; data: Patient }>(
      `/patients/${patientId}`
    );
    return data.data!;
  },

  async listPatients(): Promise<Patient[]> {
    try {
      const { data: patientsData, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && patientsData && patientsData.length > 0) {
        return patientsData.map((p) => ({
          id: p.id,
          mrn: p.mrn,
          full_name: p.full_name,
          age: p.age,
          gender: p.gender,
          contact_number: p.contact_number,
          created_at: p.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase listPatients failed, falling back to remote API:", err);
    }

    try {
      const { data } = await api.get<{ success: boolean; data: Patient[] }>("/patients");
      return data.data ?? [];
    } catch (apiErr) {
      console.error("API listPatients failed:", apiErr);
      return [];
    }
  },
};
