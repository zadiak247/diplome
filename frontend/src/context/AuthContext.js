import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setLogoutCallback } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // игнор ошибки
    }
    setUser(null);
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
    return () => setLogoutCallback(null);
  }, [logout]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      let message = 'Ошибка входа';
      if (error.response?.data?.error) message = error.response.data.error;
      else if (error.request) message = 'Нет ответа от сервера';
      else message = error.message;
      return { success: false, error: message };
    }
  };

  const register = async (email, password) => {
    try {
      await api.post('/auth/register', { email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка регистрации' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};