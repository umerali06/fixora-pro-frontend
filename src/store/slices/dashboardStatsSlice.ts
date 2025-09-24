import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface JobProgressData {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
  percentages: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export interface TurnoverData {
  amount: number;
  change: number;
  currency: string;
  chartData: Array<{
    date: string;
    amount: number;
  }>;
}

export interface DashboardStats {
  turnover: TurnoverData;
  unpaidInvoices: {
    amount: number;
    change: number;
    currency: string;
    count: number;
  };
  stockValue: {
    amount: number;
    change: number;
    currency: string;
    lowStockItems: number;
  };
  serviceRequests: {
    count: number;
    change: number;
    urgent: number;
    pending: number;
  };
  completedJobs: {
    count: number;
    change: number;
    today: number;
    thisWeek: number;
  };
  jobProgress: JobProgressData;
  customerStats: {
    total: number;
    active: number;
    newThisMonth: number;
    returning: number;
  };
  inventoryStats: {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
}

interface DashboardStatsState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

const initialState: DashboardStatsState = {
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
  autoRefresh: true,
  refreshInterval: 30, // 30 seconds
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboardStats/fetchDashboardStats',
  async (dateRange?: { start: string; end: string }) => {
    const response = await api.get('/v1/dashboard/stats', { params: dateRange });
    return response.data;
  }
);

export const refreshDashboardStats = createAsyncThunk(
  'dashboardStats/refreshDashboardStats',
  async (_, { getState, dispatch }) => {
    // Force refresh all related data
    const response = await api.get('/v1/dashboard/stats?refresh=true');
    return response.data;
  }
);

export const fetchJobProgress = createAsyncThunk(
  'dashboardStats/fetchJobProgress',
  async () => {
    const response = await api.get('/v1/dashboard/job-progress');
    return response.data;
  }
);

export const fetchTurnoverChart = createAsyncThunk(
  'dashboardStats/fetchTurnoverChart',
  async (period: 'week' | 'month' | 'quarter' | 'year') => {
    const response = await api.get(`/v1/dashboard/turnover-chart?period=${period}`);
    return response.data;
  }
);

const dashboardStatsSlice = createSlice({
  name: 'dashboardStats',
  initialState,
  reducers: {
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStatsOptimistic: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    // Update specific stat sections
    updateJobProgress: (state, action: PayloadAction<JobProgressData>) => {
      if (state.stats) {
        state.stats.jobProgress = action.payload;
      }
    },
    updateTurnover: (state, action: PayloadAction<TurnoverData>) => {
      if (state.stats) {
        state.stats.turnover = action.payload;
      }
    },
    // Increment/decrement counters for real-time updates
    incrementServiceRequests: (state) => {
      if (state.stats) {
        state.stats.serviceRequests.count += 1;
        state.stats.serviceRequests.pending += 1;
      }
    },
    decrementServiceRequests: (state) => {
      if (state.stats) {
        state.stats.serviceRequests.count = Math.max(0, state.stats.serviceRequests.count - 1);
        state.stats.serviceRequests.pending = Math.max(0, state.stats.serviceRequests.pending - 1);
      }
    },
    incrementCompletedJobs: (state) => {
      if (state.stats) {
        state.stats.completedJobs.count += 1;
        state.stats.completedJobs.today += 1;
      }
    },
    updateCustomerCount: (state, action: PayloadAction<{ total?: number; active?: number; newThisMonth?: number }>) => {
      if (state.stats) {
        state.stats.customerStats = { ...state.stats.customerStats, ...action.payload };
      }
    },
    updateInventoryStats: (state, action: PayloadAction<Partial<DashboardStats['inventoryStats']>>) => {
      if (state.stats) {
        state.stats.inventoryStats = { ...state.stats.inventoryStats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard statistics';
      })
      
      // Refresh dashboard stats
      .addCase(refreshDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshDashboardStats.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to refresh dashboard statistics';
      })
      
      // Fetch job progress
      .addCase(fetchJobProgress.fulfilled, (state, action) => {
        if (state.stats) {
          state.stats.jobProgress = action.payload;
        }
      })
      
      // Fetch turnover chart
      .addCase(fetchTurnoverChart.fulfilled, (state, action) => {
        if (state.stats) {
          state.stats.turnover = { ...state.stats.turnover, ...action.payload };
        }
      });
  },
});

export const {
  setAutoRefresh,
  setRefreshInterval,
  clearError,
  updateStatsOptimistic,
  updateJobProgress,
  updateTurnover,
  incrementServiceRequests,
  decrementServiceRequests,
  incrementCompletedJobs,
  updateCustomerCount,
  updateInventoryStats,
} = dashboardStatsSlice.actions;

export default dashboardStatsSlice.reducer;
