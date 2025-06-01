"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User } from '@/types/dashboard';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify token is still valid by fetching profile
        const userData = await authApi.getProfile();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error verifying authentication:', err);
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      setUser(response);
      
      // Role-based routing
      if (response.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard/feed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};