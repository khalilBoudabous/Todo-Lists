'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Record<string, unknown>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      return;
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = safeLocalStorage.getItem('token');
    const storedUser = safeLocalStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    try {
      if (storedUser) setUser(JSON.parse(storedUser) as User);
    } catch {
      return;
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      const newToken = response.data.token;
      safeLocalStorage.setItem('token', newToken);

      const profileResponse = await authApi.getProfile();
      const newUser = profileResponse.data.data as User;
      safeLocalStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: Record<string, unknown>): Promise<boolean> => {
    try {
      const response = await authApi.register(data);
      const newToken = response.data.token;
      const newUser = response.data.data as User;
      safeLocalStorage.setItem('token', newToken);
      safeLocalStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Register failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      safeLocalStorage.removeItem('token');
      safeLocalStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}