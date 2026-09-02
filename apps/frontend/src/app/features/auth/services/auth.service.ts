import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import {
  AuthResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from '../models/auth.models';
import {
  AUTH_STORAGE_KEY,
  readStoredSession,
} from '../utils/auth-storage.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSignal = signal<AuthSession | null>(readStoredSession());

  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);
  readonly accessToken = computed(() => this.sessionSignal()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${API_URL}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.sessionSignal.set(null);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  private setSession(response: AuthResponse): void {
    const session: AuthSession = {
      accessToken: response.accessToken,
      user: response.user,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }
}
