import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'CASHIER';
  orgId: string;
  permissions?: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
  orgId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to get valid token
export const getValidToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('🔍 getValidToken - No token in localStorage');
    return null;
  }
  
  try {
    // Basic JWT validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('🔍 getValidToken - Invalid token format (not 3 parts)');
      localStorage.removeItem('token');
      return null;
    }
    
    // Check if token is expired
    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;
    console.log('🔍 getValidToken - Token payload:', payload);
    console.log('🔍 getValidToken - Token orgId:', payload.orgId);
    console.log('🔍 getValidToken - Token exp:', payload.exp);
    console.log('🔍 getValidToken - Current time:', now);
    
    if (payload.exp && payload.exp < now) {
      console.log('🔍 getValidToken - Token expired, removing...');
      localStorage.removeItem('token');
      return null;
    }
    
    console.log('🔍 getValidToken - Token is valid');
    return token;
  } catch (error) {
    console.error('❌ getValidToken - Error parsing token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// Helper function to validate and set token
export const validateAndSetToken = (token: string): boolean => {
  if (token && token.includes('.') && token.length > 50) {
    localStorage.setItem('token', token);
    // Update axios defaults
    if (typeof window !== 'undefined') {
      const api = require('../../services/api').default;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return true;
  }
  return false;
};

// Helper function to check authentication status
export const checkAuthStatus = (): boolean => {
  const token = getValidToken();
  return !!token; // getValidToken already handles expiration and validation
};

// Helper function to refresh authentication headers
export const refreshAuthHeaders = (): void => {
  const token = getValidToken();
  if (token && typeof window !== 'undefined') {
    try {
      const api = require('../../services/api').default;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Auth headers refreshed');
    } catch (error) {
      console.error('❌ Error refreshing auth headers:', error);
    }
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Making login request to backend...');
      const response = await api.post('/auth/login', credentials);
      console.log('🔐 Backend response received:', response);
      console.log('🔐 Response status:', response.status);
      console.log('🔐 Response data:', response.data);
      console.log('🔐 Response data type:', typeof response.data);
      console.log('🔐 Response data.data:', response.data.data);
      console.log('🔐 Response data keys:', Object.keys(response.data));
      
      // Extract token and user from the nested data property
      const { token, user } = response.data.data || response.data;
      console.log('🔐 Extracted token:', token);
      console.log('🔐 Extracted user:', user);
      
      if (!token) {
        console.error('❌ No token received from backend!');
        console.error('❌ Full response data:', response.data);
        console.error('❌ Response data.data:', response.data.data);
        throw new Error('No authentication token received from server');
      }
      
      // Validate token format
      if (!token.includes('.') || token.length < 50) {
        console.error('❌ Invalid token format received:', token);
        throw new Error('Invalid token format received from server');
      }
      
      console.log('✅ Token validation passed, storing token...');
      localStorage.setItem('token', token);
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token stored and axios headers updated');
      
      // Verify token is accessible
      const storedToken = localStorage.getItem('token');
      console.log('🔍 Stored token verification:', {
        stored: !!storedToken,
        length: storedToken?.length,
        startsWith: storedToken?.substring(0, 20) + '...'
      });
      
      return { token, user };
    } catch (error: any) {
      // Log error for debugging
      console.log('Login error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle network errors first
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return rejectWithValue('🌐 Network Error: Cannot connect to server. Please check:\n\n• Server is running on port 5000\n• No firewall blocking the connection\n• Try refreshing the page');
      }
      
      // Handle connection refused
      if (error.code === 'ERR_CONNECTION_REFUSED' || error.message?.includes('Connection refused')) {
        return rejectWithValue('🔌 Connection Refused: Server is not running or not accessible.\n\nPlease:\n• Start the server (npm run server:dev)\n• Check if port 5000 is available\n• Wait a few seconds and try again');
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return rejectWithValue('⏰ Request Timeout: Server is taking too long to respond.\n\nPlease:\n• Check your internet connection\n• Wait a few seconds and try again\n• Contact support if problem persists');
      }
      
      // Handle server errors (5xx)
      if (error.response?.status >= 500) {
        return rejectWithValue('🚨 Server Error: Something went wrong on our end.\n\nPlease:\n• Wait a few minutes and try again\n• Contact support if problem persists\n• Error: ' + (error.response.data?.message || 'Unknown server error'));
      }
      
      // Handle client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response.status === 401) {
          return rejectWithValue('🔐 Authentication Failed: Invalid email, password, or organization ID.\n\nPlease check:\n• Organization ID is correct (e.g., "test-business-123")\n• Email address is correct\n• Password is correct\n• You have completed registration');
        }
        if (error.response.status === 404) {
          return rejectWithValue('❌ Not Found: Login endpoint not found.\n\nPlease:\n• Check if server is running correctly\n• Contact support if problem persists');
        }
        if (error.response.status === 422) {
          return rejectWithValue('📝 Validation Error: Please check your input.\n\n' + (error.response.data?.message || 'Some fields are invalid'));
        }
        return rejectWithValue('⚠️ Request Error: ' + (error.response.data?.message || 'Invalid request data'));
      }
      
      // Handle specific API error messages
      if (error.response?.data?.message) {
        return rejectWithValue('❌ ' + error.response.data.message);
      } else if (error.response?.data?.error) {
        return rejectWithValue('❌ ' + error.response.data.error);
      } else if (error.message) {
        return rejectWithValue('❌ ' + error.message);
      } else {
        return rejectWithValue('❌ Login failed. Please check your credentials and try again.');
      }
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } catch (error: any) {
      // Even if logout API fails, clear local storage
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 getCurrentUser - Starting...');
      console.log('🔍 getCurrentUser - Token exists:', !!localStorage.getItem('token'));
      
      const response = await api.get('/auth/profile');
      const userData = response.data.data || response.data;
      
      console.log('🔍 getCurrentUser - User profile response:', userData);
      console.log('🔍 getCurrentUser - User orgId:', userData.orgId);
      console.log('🔍 getCurrentUser - User permissions:', userData.permissions);
      
      // Ensure permissions is always an array
      const userWithPermissions = {
        ...userData,
        permissions: userData.permissions || []
      };
      
      console.log('🔍 getCurrentUser - Final user data with permissions:', userWithPermissions);
      return userWithPermissions;
    } catch (error: any) {
      console.error('❌ getCurrentUser - Error fetching user profile:', error);
      console.error('❌ getCurrentUser - Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || 'Failed to get user');
    }
  }
);

// Initialize auth state on app startup
export const initializeAuth = (): void => {
  if (typeof window !== 'undefined') {
    const token = getValidToken();
    if (token) {
      refreshAuthHeaders();
      console.log('🚀 Auth initialized with valid token');
    } else {
      console.log('🚀 Auth initialized without token');
    }
  }
};

const initialState: AuthState = {
  user: null,
  token: getValidToken(),
  isAuthenticated: checkAuthStatus(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      // Validate token format before setting
      if (action.payload && action.payload.includes('.') && action.payload.length > 50) {
        state.token = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload);
      } else {
        console.error('Invalid token format:', action.payload);
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate token before setting authentication state
        if (action.payload.token && action.payload.token.includes('.') && action.payload.token.length > 50) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          // Ensure token is stored in localStorage
          localStorage.setItem('token', action.payload.token);
        } else {
          console.error('Invalid token received from login:', action.payload.token);
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      });
  },
});

export const { clearError, setToken, clearToken } = authSlice.actions;
export default authSlice.reducer; 