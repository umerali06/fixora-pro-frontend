import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AppModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'coming_soon' | 'beta';
  category: 'core' | 'business' | 'tools' | 'integrations';
  features: string[];
  version: string;
  usage: number;
  lastUpdated: string;
  developer: string;
  isInstalled: boolean;
  isConfigured: boolean;
  route?: string;
  permissions?: string[];
  settings?: any;
}

export interface AppStats {
  total: number;
  active: number;
  beta: number;
  comingSoon: number;
  installed: number;
  configured: number;
  averageUsage: number;
}

export interface AppUsage {
  usage: number;
  lastUsed: string;
  totalUses: number;
}

export const appsAPI = {
  // Get all apps
  getApps: async (): Promise<AppModule[]> => {
    try {
      const response = await api.get('/apps');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching apps:', error);
      throw error;
    }
  },

  // Search apps
  searchApps: async (query: string, category: string = 'all'): Promise<AppModule[]> => {
    try {
      const response = await api.get('/apps/search', {
        params: { query, category }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching apps:', error);
      throw error;
    }
  },

  // Get app statistics
  getAppStats: async (): Promise<AppStats> => {
    try {
      const response = await api.get('/apps/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching app stats:', error);
      throw error;
    }
  },

  // Get app usage
  getAppUsage: async (appId: string): Promise<AppUsage> => {
    try {
      const response = await api.get(`/apps/${appId}/usage`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching app usage:', error);
      throw error;
    }
  },

  // Install an app
  installApp: async (appId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/apps/${appId}/install`);
      return response.data;
    } catch (error) {
      console.error('Error installing app:', error);
      throw error;
    }
  },

  // Uninstall an app
  uninstallApp: async (appId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/apps/${appId}/uninstall`);
      return response.data;
    } catch (error) {
      console.error('Error uninstalling app:', error);
      throw error;
    }
  },

  // Configure an app
  configureApp: async (appId: string, config: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/apps/${appId}/configure`, config);
      return response.data;
    } catch (error) {
      console.error('Error configuring app:', error);
      throw error;
    }
  }
};

export default appsAPI;
