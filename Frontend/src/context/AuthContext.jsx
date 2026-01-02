import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { clearAllTokens, setUserToken, getUserToken } from '../utils/tokenManager.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = getUserToken();
        if (token) {
          const userData = await authService.verifyToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAllTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Clear all previous tokens before login
      clearAllTokens();
      
      const response = await authService.login(email, password);
      setUser(response.user);
      setUserToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // Clear all previous tokens before registration
      clearAllTokens();
      
      const response = await authService.register(userData);
      setUser(response.user);
      setUserToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    clearAllTokens();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
