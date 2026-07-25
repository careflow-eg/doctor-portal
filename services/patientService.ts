import { api } from "@/lib/api";
import { Patient, PatientCreate } from "@/types/patient";

export const patientService = {
  async createPatient(payload: PatientCreate): Promise<Patient> {
    const { data } = await api.post<{ success: boolean; data: Patient }>(
      "/patients",
      payload
    );
    return data.data!;
  },

  async getPatient(patientId: string): Promise<Patient> {
    const { data } = await api.get<{ success: boolean; data: Patient }>(
      `/patients/${patientId}`
    );
    return data.data!;
  },
};
