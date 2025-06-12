// frontend/src/lib/api.ts  
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL - change this to match your backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Handle response errors (e.g., token expiration)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      // Store token and user in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },
  
  getProfile: async () => {
    return (await api.get('/auth/me')).data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return (await api.post('/auth/change-password', { currentPassword, newPassword })).data;
  }
};

// Company management endpoints
export const companyApi = {
  getAll: async () => {
    return (await api.get('/companies')).data;
  },
  
  getById: async (id: number) => {
    return (await api.get(`/companies/${id}`)).data;
  },
  
  create: async (companyData: any) => {
    return (await api.post('/companies', companyData)).data;
  },
  
  update: async (id: number, companyData: any) => {
    return (await api.put(`/companies/${id}`, companyData)).data;
  },
  
  delete: async (id: number) => {
    return (await api.delete(`/companies/${id}`)).data;
  },
  
  getUsers: async (id: number) => {
    return (await api.get(`/companies/${id}/users`)).data;
  },
  
  getStats: async (id: number) => {
    return (await api.get(`/companies/${id}/stats`)).data;
  }
};

// User management endpoints  
export const userApi = {
  getAll: async () => {
    return (await api.get('/users')).data;
  },
  
  getByCompany: async (companyId: number) => {
    return (await api.get(`/users?company=${companyId}`)).data;
  },
  
  getById: async (id: number) => {
    return (await api.get(`/users/${id}`)).data;
  },
  
  create: async (userData: any) => {
    return (await api.post('/users', userData)).data;
  },
  
  update: async (id: number, userData: any) => {
    return (await api.put(`/users/${id}`, userData)).data;
  },
  
  resetPassword: async (id: number, password?: string) => {
    return (await api.post(`/users/${id}/reset-password`, { password })).data;
  },
  
  delete: async (id: number) => {
    return (await api.delete(`/users/${id}`)).data;
  }
};

// Content management endpoints
export const contentApi = {
  getAll: async () => {
    return (await api.get('/content')).data;
  },
  
  getById: async (id: number) => {
    return (await api.get(`/content/${id}`)).data;
  },
  
  getByPersonaAndCompany: async (persona: number, companyId: number) => {
    return (await api.get(`/content/persona/${persona}/company/${companyId}`)).data;
  },

  create: async (contentData: any) => {
    return (await api.post('/content', contentData)).data;
  },
  
  update: async (id: number, contentData: any) => {
    return (await api.put(`/content/${id}`, contentData)).data;
  },
  
  delete: async (id: number) => {
    return (await api.delete(`/content/${id}`)).data;
  },
  
  publish: async (id: number) => {
    return (await api.post(`/content/${id}/publish`)).data;
  },
  
  updateMetrics: async (id: number, metrics: any) => {
    return (await api.post(`/content/${id}/metrics`, metrics)).data;
  }
};

// Persona management endpoints
export const personaApi = {
  getAll: async () => {
    return (await api.get('/personas')).data;
  },
  
  getById: async (id: number) => {
    return (await api.get(`/personas/${id}`)).data;
  },

  getByCompanyId: async (id: number) => {
    return (await api.get(`/personas/company/${id}`)).data;
  },
  
  create: async (personaData: any) => {
    return (await api.post('/personas', personaData)).data;
  },
  
  update: async (id: number, personaData: any) => {
    return (await api.put(`/personas/${id}`, personaData)).data;
  },
  
  delete: async (id: number) => {
    return (await api.delete(`/personas/${id}`)).data;
  },
  
  getPlatforms: async () => {
    return (await api.get('/personas/platforms/all')).data;
  },
  
  getInterests: async () => {
    return (await api.get('/personas/interests/all')).data;
  }
};

// Feed endpoints
export const feedApi = {
  getFeed: async (params: any = {}) => {
    return (await api.get('/feed', { params })).data;
  },
  
  recordEngagement: async (id: number, type: 'view' | 'like' | 'comment' | 'share') => {
    return (await api.post(`/feed/${id}/engagement`, { type })).data;
  }
};

// Enhanced insights endpoints
export const insightsApi = {
  getAll: async (params: any = {}) => {
    return (await api.get('/insights', { params })).data;
  },
  
  getById: async (id: number) => {
    return (await api.get(`/insights/${id}`)).data;
  },
  
  create: async (insightData: any) => {
    return (await api.post('/insights', insightData)).data;
  },
  
  update: async (id: number, insightData: any) => {
    return (await api.put(`/insights/${id}`, insightData)).data;
  },
  
  delete: async (id: number) => {
    return (await api.delete(`/insights/${id}`)).data;
  },
  
  getByCategory: async (category: string) => {
    return (await api.get(`/insights?category=${category}`)).data;
  },
  
  getByPlatform: async (platform: string) => {
    return (await api.get(`/insights?platform=${platform}`)).data;
  },
  
  getActionable: async () => {
    return (await api.get('/insights?actionable=true')).data;
  },
  
  getByAuthor: async (authorId: number) => {
    return (await api.get(`/insights?author=${authorId}`)).data;
  },
  
  search: async (searchTerm: string, filters: any = {}) => {
    const params = { search: searchTerm, ...filters };
    return (await api.get('/insights', { params })).data;
  },
  
  getStats: async () => {
    return (await api.get('/insights/stats')).data;
  }
};

// Export default API object
export default {
  auth: authApi,
  companies: companyApi,
  users: userApi,
  content: contentApi,
  personas: personaApi,
  feed: feedApi,
  insights: insightsApi
};