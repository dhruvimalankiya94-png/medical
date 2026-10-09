import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('healthcare_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          console.warn('Session token expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    if (data.token) {
      localStorage.setItem('healthcare_token', data.token);
      localStorage.setItem('healthcare_user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('healthcare_token');
    localStorage.removeItem('healthcare_user');
    setToken('');
    setUser(null);
  };

  /**
   * Re-read the signed-in user from the server and update the cached copy.
   * Used after a profile or avatar change so the sidebar and topbar pick up the
   * new values without a full page reload.
   */
  const refreshUser = async () => {
    const userData = await authAPI.getMe();
    setUser(userData);
    localStorage.setItem('healthcare_user', JSON.stringify(userData));
    return userData;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
