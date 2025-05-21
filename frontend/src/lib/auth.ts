import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { LoginCredentials, User, AuthResponse } from '@/types/auth';
import api from './api';
import jwt from 'jsonwebtoken';

export const TOKEN_KEY = 'lululemon_token';

export const setAuthToken = (token: string): void => {
  setCookie(TOKEN_KEY, token, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const removeAuthToken = (): void => {
  deleteCookie(TOKEN_KEY);
};

export const getUserFromToken = (): User | null => {
  const token = getCookie(TOKEN_KEY);
  
  if (!token) return null;
  
  try {
    const decoded = jwt.decode(token as string) as User;
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getCookie(TOKEN_KEY);
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    setAuthToken(token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: any): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    const { token, user } = response.data;
    
    setAuthToken(token);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = (): void => {
  removeAuthToken();
  window.location.href = '/auth/login';
};

// Auth hook
export const useAuth = () => {
  const router = useRouter();

  const authLogout = () => {
    removeAuthToken();
    router.push('/auth/login');
  };

  const checkAuth = () => {
    const isAuth = isAuthenticated();
    if (!isAuth) {
      router.push('/auth/login');
    }
    return isAuth;
  };

  return {
    login,
    logout: authLogout,
    register,
    isAuthenticated,
    checkAuth,
    getUserFromToken,
  };
};