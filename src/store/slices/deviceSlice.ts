import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Device {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REPAIR' | 'RETIRED';
  purchaseDate: string;
  warrantyExpiry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    type: string[];
    brand: string[];
    status: string[];
    customerId: string[];
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  bulkOperations: {
    selectedIds: string[];
    isAllSelected: boolean;
    bulkLoading: boolean;
  };
}

const initialState: DeviceState = {
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    type: [],
    brand: [],
    status: [],
    customerId: [],
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  bulkOperations: {
    selectedIds: [],
    isAllSelected: false,
    bulkLoading: false,
  },
};

// Async thunks
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/devices', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch devices');
    }
  }
);

export const fetchDeviceById = createAsyncThunk(
  'devices/fetchDeviceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/devices/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch device');
    }
  }
);

export const createDevice = createAsyncThunk(
  'devices/createDevice',
  async (deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/devices', deviceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create device');
    }
  }
);

export const updateDevice = createAsyncThunk(
  'devices/updateDevice',
  async ({ id, updates }: { id: string; updates: Partial<Device> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/devices/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update device');
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'devices/deleteDevice',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/devices/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete device');
    }
  }
);

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setSelectedDevice: (state, action: PayloadAction<Device | null>) => {
      state.selectedDevice = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<DeviceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<DeviceState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.bulkOperations.selectedIds = action.payload;
    },
    toggleSelectedId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.bulkOperations.selectedIds.indexOf(id);
      if (index > -1) {
        state.bulkOperations.selectedIds.splice(index, 1);
      } else {
        state.bulkOperations.selectedIds.push(id);
      }
    },
    selectAllDevices: (state) => {
      state.bulkOperations.isAllSelected = true;
      state.bulkOperations.selectedIds = state.devices.map(device => device.id);
    },
    clearSelectedDevices: (state) => {
      state.bulkOperations.isAllSelected = false;
      state.bulkOperations.selectedIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetDevicesState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload.devices || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch devices';
      })
      
      // Fetch device by ID
      .addCase(fetchDeviceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDevice = action.payload;
      })
      .addCase(fetchDeviceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch device';
      })
      
      // Create device
      .addCase(createDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.devices.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create device';
      })
      
      // Update device
      .addCase(updateDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.devices.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.devices[index] = action.payload;
        }
        if (state.selectedDevice?.id === action.payload.id) {
          state.selectedDevice = action.payload;
        }
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update device';
      })
      
      // Delete device
      .addCase(deleteDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = state.devices.filter(d => d.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedDevice?.id === action.payload) {
          state.selectedDevice = null;
        }
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete device';
      });
  },
});

export const {
  setSelectedDevice,
  setSearchQuery,
  setFilters,
  setPagination,
  setSelectedIds,
  toggleSelectedId,
  selectAllDevices,
  clearSelectedDevices,
  clearError,
  resetDevicesState,
} = deviceSlice.actions;

export default deviceSlice.reducer;
