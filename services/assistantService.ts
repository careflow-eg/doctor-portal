import { api } from "@/lib/api";
import { AssistantResponse } from "@/types/dashboard";

export const assistantService = {
  async queryAssistant(
    encounterId: string,
    query: string
  ): Promise<AssistantResponse> {
    const { data } = await api.post<{ success: boolean; data: AssistantResponse }>(
      `/encounters/${encounterId}/assistant`,
      { query }
    );
    return data.data ?? {};
  },
};
