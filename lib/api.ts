// API client with JWT auth and auto-refresh
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://careflow-workflow-orchestrator.up.railway.app";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}`,
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
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear tokens and redirect to login only when accessing protected routes
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("careflow_user");
        
        const pathname = window.location.pathname;
        if (pathname !== "/login" && pathname !== "/register") {
          window.location.href = "/login";
        }
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
    baseURL: `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}`,
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 300000, // 5 min for large file uploads
  });
}
