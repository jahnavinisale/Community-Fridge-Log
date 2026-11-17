import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cfl_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cfl_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('cfl_token');
    localStorage.removeItem('cfl_user');
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const current = await authApi.getCurrentUser();
      setUser(current);
      localStorage.setItem('cfl_user', JSON.stringify(current));
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshUser();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('cfl-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('cfl-auth-expired', handleAuthExpired);
  }, [refreshUser, logout]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('cfl_token', data.token);
    localStorage.setItem('cfl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer' || user?.role === 'admin',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
