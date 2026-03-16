import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, checkAuth } from '../api';
import type { AuthUser } from '../types/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { ok, data } = await checkAuth();
      if (ok && data?.user) {
        setUser(data.user);
      } else if (data && data.user === null) {
        // Server explicitly returned null user - token is invalid
        await authApi.logout();
        setUser(null);
      }
      // If network error (not ok), keep the current user state - don't logout
    } catch {
      // Network error - keep current user state, don't logout
      // The user stays logged in until they manually logout
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load user from AsyncStorage on initial mount
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('authToken');
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // Ignore storage errors
      } finally {
        setLoading(false);
      }
    };
    loadStoredUser();
  }, []);

  const login: AuthContextValue['login'] = async (emailOrUsername, password) => {
    const res = await authApi.login(emailOrUsername, password);
    if (res.success && res.token && res.user) {
      await AsyncStorage.setItem('authToken', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user as AuthUser);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register: AuthContextValue['register'] = async (username, email, password, confirmPassword) => {
    const res = await authApi.register(username, email, password, confirmPassword);
    if (res.success && res.token && res.user) {
      await AsyncStorage.setItem('authToken', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user as AuthUser);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUser = async (updatedUser: AuthUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, reload, updateUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

