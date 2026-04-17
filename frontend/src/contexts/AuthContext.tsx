import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '../lib/api';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = useCallback(async (email: string, password: string, tenantSlug: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password, tenantSlug });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('tenantId', data.user.tenantId);
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token && !user) {
      api.get<User>('/auth/me').then(({ data }) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }).catch(() => logout());
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
