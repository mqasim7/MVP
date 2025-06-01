import { User } from '@/types/dashboard';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  console.log(userStr);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};