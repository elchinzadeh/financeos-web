import { apiFetch } from './client';

export type ClientType = 'mobile' | 'web' | 'ai_chat' | 'api' | 'mcp';

export interface AuthUser {
  id: string;
  email: string;
  baseCurrency: string;
  locale: string;
}

export interface AuthClient {
  id: string;
  type: ClientType;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  client: AuthClient;
}

export interface MeResponse {
  user: AuthUser;
  client: AuthClient;
}

const WEB_CLIENT_INFO = { type: 'web' as const, name: 'FinanceOS Web' };

export function register(input: {
  email: string;
  password: string;
  baseCurrency: string;
  locale: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { ...input, client: WEB_CLIENT_INFO },
  });
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { ...input, client: WEB_CLIENT_INFO },
  });
}

export function logout(token: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/logout', { method: 'POST', token });
}

export function me(token: string): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me', { token });
}

export function deactivateAccount(token: string, password: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/deactivate', { method: 'POST', token, body: { password } });
}

export function deleteAllData(token: string, password: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/delete-data', { method: 'POST', token, body: { password } });
}

export function forgotPassword(email: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword(token: string, password: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>('/auth/reset-password', { method: 'POST', body: { token, password } });
}
