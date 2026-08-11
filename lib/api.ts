// API client without automatic JWT Authorization header injection
import axios, { AxiosInstance, AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.careflowai.health";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Response interceptor — handle API errors gracefully without auto-redirecting
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("API request returned 401 Unauthorized:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Helper for file uploads (multipart/form-data) without Bearer header
export function createFormDataApi() {
  return axios.create({
    baseURL: `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000, // 5 min for large file uploads
  });
}
