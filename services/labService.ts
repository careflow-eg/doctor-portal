import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

export const labService = {
  async uploadLabReport(
    encounterId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, unknown>> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post<{ success: boolean; data: Record<string, unknown> }>(
      `${BASE_URL}${API_PREFIX}/encounters/${encounterId}/lab`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 120000,
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
