import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface DashboardData {
  turnover: {
    amount: number;
    change: number;
    currency: string;
  };
  unpaidInvoices: {
    amount: number;
    change: number;
    currency: string;
  };
  stockValue: {
    amount: number;
    change: number;
    currency: string;
  };
  serviceRequests: {
    count: number;
    type: string;
  };
  completedJobs: {
    count: number;
    date: string;
  };
  jobProgress: {
    pending: number;
    inProgress: number;
    total: number;
  };
  recentActivities: any[];
  todos: any[];
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/dashboard/overview');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchTurnoverChart = createAsyncThunk(
  'dashboard/fetchTurnoverChart',
  async (period: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/dashboard/turnover-chart?period=${period}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch turnover chart');
    }
  }
);

export const fetchJobStats = createAsyncThunk(
  'dashboard/fetchJobStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/dashboard/job-stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch job statistics');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateDashboardData: (state, action: PayloadAction<Partial<DashboardData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer; 