// API client with JWT auth and auto-refresh
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://careflow-workflow-orchestrator.up.railway.app";
const API_PREFIX = "/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor — inject Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("careflow_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper for file uploads (multipart/form-data)
export function createFormDataApi() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;
  return axios.create({
    baseURL: `${BASE_URL}${API_PREFIX}`,
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 120000, // 2 min for file uploads
  });
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
