import { api } from "@/lib/api";
import { Token, LoginRequest, RegisterRequest, User } from "@/types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<Token> {
    try {
      // 1. Try local Supabase doctor auth endpoint
      const res = await fetch("/api/doctor/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("careflow_user", JSON.stringify(data.user));
          }
          return data;
        }
      }
    } catch (localErr) {
      console.warn("Local doctor auth failed, falling back to orchestrator:", localErr);
    }

    // 2. Fallback to orchestrator API endpoint
    const { data } = await api.post<Token>("/auth/login", credentials);
    if (data && data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("careflow_user", JSON.stringify(data.user));
      }
    }
    return data;
  },

  async register(payload: RegisterRequest): Promise<{ data: User }> {
    const { data } = await api.post<{ success: boolean; data: User }>(
      "/auth/register",
      payload
    );
    return data;
  },

  async getMe(): Promise<User> {
    try {
      const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
      return data.data;
    } catch (err) {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("careflow_user");
        if (userStr) return JSON.parse(userStr);
      }
      throw err;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("careflow_user");
    }
  },
};
