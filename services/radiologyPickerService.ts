import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_MEDSAM2_API_URL || "https://api.cairflowai.health";
const API_PREFIX = process.env.NEXT_PUBLIC_MEDSAM2_API_PREFIX ?? "";


export interface SegmentationResponse {
  success: boolean;
  message: string;
  mask_coverage_percent?: number;
  mask_pixels?: number;
  total_pixels?: number;
  boxes_processed?: number;
  inference_time_ms?: number;
  binary_mask_base64?: string;
  overlay_image_base64?: string;
}

export const radiologyPickerService = {
  async segmentImage(
    file: File,
    boxes: number[][],
    maskOpacity: number = 0.5,
    onProgress?: (progress: number) => void
  ): Promise<SegmentationResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("boxes", JSON.stringify(boxes));
    formData.append("mask_opacity", maskOpacity.toString());

    // We don't attach the standard app bearer token because this is an external ML service
    // If it requires authentication in the future, we can add it here.
    const { data } = await axios.post<SegmentationResponse>(
      `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}/segment`,
      formData,

      {
        headers: {
          "Content-Type": "multipart/form-data",
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
    return data;
  },
};
