export type UserRole = "Admin" | "Teacher" | "Student";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}