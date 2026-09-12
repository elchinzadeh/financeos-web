'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { me, type AuthUser, type AuthClient } from '@/lib/api/auth';
import { registerUnauthorizedHandler } from '@/lib/api/client';

const TOKEN_STORAGE_KEY = 'financeos.token';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  client: AuthClient | null;
  isLoading: boolean;
  setSession: (token: string, user: AuthUser, client: AuthClient) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [client, setClient] = useState<AuthClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function clearSession() {
    setToken(null);
    setUser(null);
    setClient(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  function setSession(nextToken: string, nextUser: AuthUser, nextClient: AuthClient) {
    setToken(nextToken);
    setUser(nextUser);
    setClient(nextClient);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    }
  }

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearSession();
      router.replace('/login');
    });
  }, [router]);

  useEffect(() => {
    async function hydrate() {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (!stored) return;
      try {
        const res = await me(stored);
        setToken(stored);
        setUser(res.user);
        setClient(res.client);
      } catch {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    hydrate().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({ token, user, client, isLoading, setSession, clearSession }),
    [token, user, client, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() AuthProvider daxilində çağırılmalıdır');
  }
  return ctx;
}
