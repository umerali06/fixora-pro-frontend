import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface POSOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: POSOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POSOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface POSState {
  orders: POSOrder[];
  selectedOrder: POSOrder | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    status: string[];
    paymentMethod: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
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

const initialState: POSState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    status: [],
    paymentMethod: [],
    dateRange: {
      start: null,
      end: null,
    },
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
export const fetchPOSOrders = createAsyncThunk(
  'pos/fetchOrders',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/pos/orders', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch POS orders');
    }
  }
);

export const fetchPOSOrderById = createAsyncThunk(
  'pos/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/pos/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch POS order');
    }
  }
);

export const createPOSOrder = createAsyncThunk(
  'pos/createOrder',
  async (orderData: Omit<POSOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/pos/orders', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create POS order');
    }
  }
);

export const updatePOSOrder = createAsyncThunk(
  'pos/updateOrder',
  async ({ id, updates }: { id: string; updates: Partial<POSOrder> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/pos/orders/${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update POS order');
    }
  }
);

export const deletePOSOrder = createAsyncThunk(
  'pos/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/pos/orders/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete POS order');
    }
  }
);

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<POSOrder | null>) => {
      state.selectedOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<POSState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<POSState['pagination']>>) => {
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
    selectAllOrders: (state) => {
      state.bulkOperations.isAllSelected = true;
      state.bulkOperations.selectedIds = state.orders.map(order => order.id);
    },
    clearSelectedOrders: (state) => {
      state.bulkOperations.isAllSelected = false;
      state.bulkOperations.selectedIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPOSState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch POS orders
      .addCase(fetchPOSOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPOSOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchPOSOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch POS orders';
      })
      
      // Fetch POS order by ID
      .addCase(fetchPOSOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPOSOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchPOSOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch POS order';
      })
      
      // Create POS order
      .addCase(createPOSOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPOSOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createPOSOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create POS order';
      })
      
      // Update POS order
      .addCase(updatePOSOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePOSOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updatePOSOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update POS order';
      })
      
      // Delete POS order
      .addCase(deletePOSOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePOSOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(o => o.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null;
        }
      })
      .addCase(deletePOSOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete POS order';
      });
  },
});

export const {
  setSelectedOrder,
  setSearchQuery,
  setFilters,
  setPagination,
  setSelectedIds,
  toggleSelectedId,
  selectAllOrders,
  clearSelectedOrders,
  clearError,
  resetPOSState,
} = posSlice.actions;

export default posSlice.reducer;
