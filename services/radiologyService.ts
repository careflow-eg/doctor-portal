import { createFormDataApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const radiologyService = {
  async uploadRadiologyImage(
    encounterId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append("file", file);

    const api = createFormDataApi();
    try {
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
      if (data?.data) return data.data;
      throw new Error("No radiology analysis findings returned from VLM service");
    } catch (err: any) {
      console.error("Radiology image processing error:", err);

      // Check if real radiology step result already exists in database for this encounter
      const { data: dbStep } = await supabase
        .from("encounter_step_results")
        .select("structured_data")
        .eq("encounter_id", encounterId)
        .eq("service_name", "RADIOLOGY")
        .eq("status", "SUCCESS")
        .single();

      if (dbStep?.structured_data) {
        return dbStep.structured_data as Record<string, unknown>;
      }

      const errMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Failed to analyze radiology image";
      throw new Error(errMsg);
    }
  },
};
