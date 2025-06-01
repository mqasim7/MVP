export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData extends LoginCredentials {
    name: string;
    role?: 'admin' | 'editor' | 'viewer';
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface AuthError {
    message: string;
    field?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    avatar?: string;
    title?: string;
    createdAt: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }