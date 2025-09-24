import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Activity {
  id: string;
  type: 'CUSTOMER_CREATED' | 'REPAIR_STARTED' | 'REPAIR_COMPLETED' | 'INVOICE_SENT' | 'PAYMENT_RECEIVED' | 'INVENTORY_UPDATED' | 'TODO_COMPLETED' | 'USER_ACTION';
  title: string;
  description: string;
  entityType: 'CUSTOMER' | 'REPAIR_TICKET' | 'INVOICE' | 'INVENTORY' | 'TODO' | 'USER';
  entityId?: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  createdAt: string;
  icon?: string;
  color?: string;
}

interface ActivitiesState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: {
    type: string[];
    entityType: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
}

const initialState: ActivitiesState = {
  activities: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    type: [],
    entityType: [],
    dateRange: {
      start: null,
      end: null,
    },
  },
};

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params?: {
    page?: number;
    pageSize?: number;
    filters?: any;
  }) => {
    const response = await api.get('/v1/activities', { params });
    return response.data;
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (activityData: Omit<Activity, 'id' | 'createdAt' | 'userId' | 'userName'>) => {
    const response = await api.post('/v1/activities', activityData);
    return response.data;
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id: string) => {
    await api.delete(`/v1/activities/${id}`);
    return id;
  }
);

export const clearAllActivities = createAsyncThunk(
  'activities/clearAllActivities',
  async () => {
    await api.delete('/v1/activities/clear');
    return [];
  }
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    addActivityOptimistic: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload);
      state.pagination.total += 1;
    },
    removeActivityOptimistic: (state, action: PayloadAction<string>) => {
      state.activities = state.activities.filter(activity => activity.id !== action.payload);
      state.pagination.total -= 1;
    },
    // Helper to add activity locally for immediate feedback
    addLocalActivity: (state, action: PayloadAction<{
      type: Activity['type'];
      title: string;
      description: string;
      entityType: Activity['entityType'];
      entityId?: string;
      metadata?: Record<string, any>;
    }>) => {
      const activity: Activity = {
        id: `temp-${Date.now()}`,
        ...action.payload,
        userId: 'current-user',
        userName: 'Current User',
        createdAt: new Date().toISOString(),
      };
      state.activities.unshift(activity);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities';
      })
      
      // Create activity
      .addCase(createActivity.fulfilled, (state, action) => {
        // Replace temp activity or add new one
        const tempIndex = state.activities.findIndex(a => a.id.startsWith('temp-'));
        if (tempIndex !== -1) {
          state.activities[tempIndex] = action.payload;
        } else {
          state.activities.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create activity';
        // Remove temp activity on error
        state.activities = state.activities.filter(a => !a.id.startsWith('temp-'));
      })
      
      // Delete activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter(activity => activity.id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete activity';
      })
      
      // Clear all activities
      .addCase(clearAllActivities.fulfilled, (state) => {
        state.activities = [];
        state.pagination.total = 0;
      })
      .addCase(clearAllActivities.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to clear activities';
      });
  },
});

export const {
  setFilters,
  setPagination,
  clearError,
  addActivityOptimistic,
  removeActivityOptimistic,
  addLocalActivity,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
