// Authentication types matching workflow_orchestrator schemas

export type UserRole = "DOCTOR" | "NURSE" | "ADMIN" | "PATIENT";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}
