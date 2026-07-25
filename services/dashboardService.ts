import { api } from "@/lib/api";
import { ClinicalDashboard } from "@/types/dashboard";

export const dashboardService = {
  async generateDashboard(encounterId: string): Promise<ClinicalDashboard> {
    const { data } = await api.post<{ success: boolean; data: ClinicalDashboard }>(
      `/encounters/${encounterId}/dashboard`
    );
    return data.data ?? {};
  },
};
