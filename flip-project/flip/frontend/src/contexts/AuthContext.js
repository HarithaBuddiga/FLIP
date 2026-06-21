import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.getMe();
    setUser(data.data.user);
    return data.data.user;
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    await authAPI.login({ email, password });
    return refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (name, email, password) => {
    await authAPI.register({ name, email, password });
    return refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
