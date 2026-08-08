import { api } from "@/lib/api";
import { Encounter, EncounterCreate } from "@/types/encounter";

export const encounterService = {
  async createEncounter(payload: EncounterCreate): Promise<Encounter> {
    const { data } = await api.post<{ success: boolean; data: Encounter }>(
      "/encounters",
      payload
    );
    return data.data!;
  },

  async listEncounters(patientId?: string): Promise<Encounter[]> {
    const params = patientId ? { patient_id: patientId } : {};
    const { data } = await api.get<{ success: boolean; data: Encounter[] }>(
      "/encounters",
      { params }
    );
    return data.data ?? [];
  },

  async getEncounter(encounterId: string): Promise<Encounter> {
    const { data } = await api.get<{ success: boolean; data: Encounter }>(
      `/encounters/${encounterId}`
    );
    return data.data!;
  },

  async endEncounter(encounterId: string): Promise<Encounter> {
    const { data } = await api.post<{ success: boolean; data: Encounter }>(
      `/encounters/${encounterId}/complete`
    );
    return data.data!;
  },
};
