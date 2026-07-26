import { api } from "@/lib/api";
import { AssistantResponse } from "@/types/dashboard";

export interface AssistantChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const assistantService = {
  async queryAssistant(
    encounterId: string,
    query: string,
    chatHistory: AssistantChatTurn[] = []
  ): Promise<AssistantResponse> {
    const { data } = await api.post<{ success: boolean; data: AssistantResponse }>(
      `/encounters/${encounterId}/assistant`,
      { query, chat_history: chatHistory }
    );
    return data.data ?? {};
  },
};
