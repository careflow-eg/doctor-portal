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
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const formData = new FormData();
    formData.append("file", audioBlob, filename);

    const { data: responseData } = await (
      await import("axios")
    ).default.post<{ success: boolean; data: Record<string, unknown> }>(
      `${process.env.NEXT_PUBLIC_API_URL ?? "https://careflow-workflow-orchestrator.up.railway.app"}/api/v1/encounters/${encounterId}/history/audio`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 60000,
      }
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
