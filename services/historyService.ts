import { api } from "@/lib/api";

export const historyService = {
  async startHistorySession(encounterId: string): Promise<Record<string, unknown>> {
    const { data } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
      `/encounters/${encounterId}/history/start`
    );
    return data.data ?? {};
  },

  async processTextTurn(
    encounterId: string,
    text: string
  ): Promise<Record<string, unknown>> {
    const { data } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
      `/encounters/${encounterId}/history/text`,
      { text }
    );
    return data.data ?? {};
  },

  async processAudioTurn(
    encounterId: string,
    audioBlob: Blob,
    filename = "audio.wav"
  ): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append("file", audioBlob, filename);

    const api = createFormDataApi();
    const { data: responseData } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
      `/encounters/${encounterId}/history/audio`,
      formData
    );
    return responseData.data ?? {};
  },

  async finishHistorySession(encounterId: string): Promise<Record<string, unknown>> {
    const { data } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
      `/encounters/${encounterId}/history/finish`
    );
    return data.data ?? {};
  },
};
