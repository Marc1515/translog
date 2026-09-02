export type UserRole = 'OPERATOR' | 'SUPERVISOR';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
