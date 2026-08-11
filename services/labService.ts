import { createFormDataApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const labService = {
  async uploadLabReport(
    encounterId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append("file", file);

    const api = createFormDataApi();
    try {
      const { data } = await api.post<{ success: boolean; data: Record<string, unknown> }>(
        `/encounters/${encounterId}/lab`,
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
      throw new Error("No structured OCR data returned from lab service");
    } catch (err: any) {
      console.error("Lab report processing error:", err);

      // Check if real OCR step result already exists in database for this encounter
      const { data: dbStep } = await supabase
        .from("encounter_step_results")
        .select("structured_data")
        .eq("encounter_id", encounterId)
        .eq("service_name", "LAB_OCR")
        .eq("status", "SUCCESS")
        .single();

      if (dbStep?.structured_data) {
        return dbStep.structured_data as Record<string, unknown>;
      }

      const errMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Failed to process lab report";
      throw new Error(errMsg);
    }
  },
};
