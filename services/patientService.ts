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
      console.warn("API createPatient failed, fallback to Supabase:", err);
    }

    const { data: newP, error } = await supabase
      .from("patients")
      .insert([
        {
          full_name: payload.full_name,
          mrn: payload.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
          age: payload.age,
          gender: payload.gender,
          contact_number: payload.contact_number,
        },
      ])
      .select("*")
      .single();

    if (error || !newP) {
      throw new Error(error?.message || "Failed to create patient in database");
    }

    return {
      id: newP.id,
      mrn: newP.mrn,
      full_name: newP.full_name,
      age: newP.age,
      gender: newP.gender,
      contact_number: newP.contact_number,
      created_at: newP.created_at,
    };
  },

  async getPatient(patientId: string): Promise<Patient> {
    try {
      const { data } = await api.get<{ success: boolean; data: Patient }>(
        `/patients/${patientId}`
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.warn(`API getPatient(${patientId}) failed, querying Supabase directly:`, err);
    }

    const { data: p, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    if (error || !p) {
      throw new Error(`Patient ${patientId} not found in database`);
    }

    return {
      id: p.id,
      mrn: p.mrn || "MRN-000000",
      full_name: p.full_name || "Patient",
      age: p.age || 30,
      gender: p.gender || "Male",
      contact_number: p.contact_number || "",
      created_at: p.created_at,
    };
  },

  async listPatients(): Promise<Patient[]> {
    try {
      const { data } = await api.get<{ success: boolean; data: Patient[] }>("/patients");
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    } catch (err) {
      console.warn("API listPatients failed, querying Supabase directly:", err);
    }

    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !patients) return [];

    return patients.map((p) => ({
      id: p.id,
      mrn: p.mrn || "MRN-000000",
      full_name: p.full_name || "Patient",
      age: p.age || 30,
      gender: p.gender || "Male",
      contact_number: p.contact_number || "",
      created_at: p.created_at,
    }));
  },
};
