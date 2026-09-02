import { AuthSession } from '../models/auth.models';

export const AUTH_STORAGE_KEY = 'translog.auth';

export function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isAuthSession(parsed)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function readStoredAccessToken(): string | null {
  return readStoredSession()?.accessToken ?? null;
}

function isUserRole(value: unknown): value is AuthSession['user']['role'] {
  return value === 'OPERATOR' || value === 'SUPERVISOR';
}

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;
  const user = session['user'];

  if (typeof user !== 'object' || user === null) {
    return false;
  }

  const authUser = user as Record<string, unknown>;
  return (
    typeof session['accessToken'] === 'string' &&
    typeof authUser['id'] === 'string' &&
    typeof authUser['email'] === 'string' &&
    isUserRole(authUser['role'])
  );
}
