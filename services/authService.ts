import { api } from "@/lib/api";
import { Token, LoginRequest, RegisterRequest, User } from "@/types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<Token> {
    const { data } = await api.post<Token>("/auth/login", credentials);
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
    const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
    return data.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("careflow_user");
    }
  },
};
