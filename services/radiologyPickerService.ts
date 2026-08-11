import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_MEDSAM2_API_URL || "https://api.careflowai.health";
const API_PREFIX = process.env.NEXT_PUBLIC_MEDSAM2_API_PREFIX ?? "/api/v1";

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
    formData.append("boxes_json", JSON.stringify(boxes));
    formData.append("mask_opacity", maskOpacity.toString());

    const response = await axios.post<SegmentationResponse>(
      `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}/radiology/segment-box`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },
};
