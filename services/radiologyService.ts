import { createFormDataApi } from "@/lib/api";

export const radiologyService = {
  async uploadRadiologyImage(
    encounterId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append("file", file);

    const api = createFormDataApi();
    const { data } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
      `/encounters/${encounterId}/radiology`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const pct = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(pct);
          }
        },
      }
    );
    return data.data ?? {};
  },
};
